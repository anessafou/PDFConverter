"""LibreOffice UNO helper for per-sheet Calc PDF layout (system Python)."""

from __future__ import annotations

import os
import sys
import time
import traceback
from pathlib import Path

import uno
from com.sun.star.beans import PropertyValue


PORTRAIT_A4_WIDTH = 21000  # UNO page dimensions and margins use 1/100 mm.
CONTENT_CELL_FLAGS = 1 | 2 | 4 | 16  # VALUE | DATETIME | STRING | FORMULA
READONLY_PROPERTY_ATTRIBUTE = 1
MAX_MERGED_TEXT_WIDTH = 17000  # Keep a long merged label within printable A4 width.
MAX_CELL_TEXT_WIDTH = 17000
LAYOUT_DIAGNOSTICS = os.environ.get("PDFCONV_CALC_LAYOUT_DIAGNOSTICS") == "1"


def diagnostic(message: str, *values: object) -> None:
    if LAYOUT_DIAGNOSTICS:
        print("[calc-layout] " + message % values, file=sys.stderr, flush=True)


def address_tuple(address: object) -> tuple[int, int, int, int]:
    return (
        int(address.StartColumn),
        int(address.StartRow),
        int(address.EndColumn),
        int(address.EndRow),
    )


def print_area_tuples(sheet: object) -> list[tuple[int, int, int, int]]:
    return [address_tuple(area) for area in sheet.getPrintAreas()]


def used_range_tuple(sheet: object) -> tuple[int, int, int, int] | None:
    cursor = sheet.createCursor()
    cursor.gotoStartOfUsedArea(False)
    cursor.gotoEndOfUsedArea(True)
    address = cursor.getRangeAddress()
    if address.EndColumn < address.StartColumn:
        return None
    return address_tuple(address)


def page_style_state(document: object, style_name: str) -> dict[str, object]:
    styles = document.getStyleFamilies().getByName("PageStyles")
    style = styles.getByName(style_name)
    names = (
        "Width", "Height", "IsLandscape", "ScaleToPages", "ScaleToPagesX",
        "ScaleToPagesY", "PageScale", "LeftMargin", "RightMargin",
        "TopMargin", "BottomMargin",
    )
    state: dict[str, object] = {}
    available = {prop.Name for prop in style.getPropertySetInfo().getProperties()}
    for name in names:
        if name in available:
            state[name] = style.getPropertyValue(name)
    return state


def property_value(name: str, value: object) -> PropertyValue:
    item = PropertyValue()
    item.Name = name
    item.Value = value
    item.Handle = 0
    item.State = 0
    return item


def used_column_bounds(sheet: object) -> tuple[int, int] | None:
    print_areas = sheet.getPrintAreas()
    if print_areas:
        return (
            min(area.StartColumn for area in print_areas),
            max(area.EndColumn for area in print_areas),
        )

    cursor = sheet.createCursor()
    cursor.gotoStartOfUsedArea(False)
    cursor.gotoEndOfUsedArea(True)
    area = cursor.getRangeAddress()
    if area.EndColumn < area.StartColumn:
        return None
    if sheet.queryContentCells(CONTENT_CELL_FLAGS).getCount() == 0:
        return None
    return area.StartColumn, area.EndColumn


def clone_page_style(document: object, source: object, name: str) -> object:
    page_styles = document.getStyleFamilies().getByName("PageStyles")
    clone = document.createInstance("com.sun.star.sheet.TablePageStyle")
    page_styles.insertByName(name, clone)

    # Copy writable properties so margins, headers/footers, print options, and
    # other existing sheet settings are retained where UNO allows.
    for prop in source.getPropertySetInfo().getProperties():
        if prop.Attributes & 1:  # beans.PropertyAttribute.READONLY
            continue
        try:
            clone.setPropertyValue(prop.Name, source.getPropertyValue(prop.Name))
        except Exception as exc:
            # Some optional or implementation-specific style values cannot be
            # copied to a new style. Required layout values are set explicitly.
            diagnostic(
                "optional page-style copy skipped style=%s property=%s error=%s: %s",
                name, prop.Name, type(exc).__name__, exc,
            )
    return clone


def set_verified_properties(component: object, values: tuple[tuple[str, object], ...]) -> None:
    """Set only UNO properties confirmed present and writable at runtime."""
    property_info = component.getPropertySetInfo()
    available = {item.Name: item for item in property_info.getProperties()}
    for name, value in values:
        item = available.get(name)
        if item is None:
            raise RuntimeError(f"Required UNO property is unavailable: {name}")
        if item.Attributes & READONLY_PROPERTY_ATTRIBUTE:
            raise RuntimeError(f"Required UNO property is read-only: {name}")
        try:
            component.setPropertyValue(name, value)
        except Exception as exc:
            diagnostic(
                "property set failed component=%s property=%s error=%s: %s",
                type(component).__name__, name, type(exc).__name__, exc,
            )
            raise


def set_manual_column_width(sheet: object, column_index: int, column: object, width: int) -> None:
    """Apply a direct UNO width write and verify the effective column geometry."""
    before = int(column.Width)
    if width <= before:
        return
    optimal_before = bool(column.getPropertyValue("OptimalWidth"))
    # UNO advertises Width as a long. Pad by one twip in hundredths of a
    # millimetre so Calc's internal unit conversion cannot undershoot the target.
    requested = width + 2
    try:
        uno.invoke(column, "setPropertyValue", ("Width", uno.Any("long", requested)))
    except Exception as exc:
        raise RuntimeError(
            f"Calc rejected Width for sheet {sheet.Name!r}, column {column_index}, "
            f"before {before}, requested {requested}: {type(exc).__name__}"
        ) from exc
    after = int(column.Width)
    diagnostic(
        "explicit width write sheet=%r column=%d before=%d target=%d requested=%d after=%d optimal_before=%s optimal_after=%s",
        sheet.Name, column_index, before, width, requested, after, optimal_before,
        bool(column.getPropertyValue("OptimalWidth")),
    )
    if after <= before or after < width:
        raise RuntimeError(
            f"Calc column width write did not take effect for sheet {sheet.Name!r}, "
            f"column {column_index}: before {before}, target {width}, "
            f"requested {requested}, read back {after}"
        )


def cell_in_print_areas(column: int, row: int, print_areas: list[object]) -> bool:
    if not print_areas:
        return True
    return any(
        area.StartColumn <= column <= area.EndColumn
        and area.StartRow <= row <= area.EndRow
        for area in print_areas
    )


def estimated_text_width(text: str, font_points: float) -> int:
    # 30 hundredths of a millimetre per point/character is intentionally
    # conservative for bold and wide glyphs; add a small cell padding margin.
    return int(len(text) * font_points * 30 + 500)


def fit_content_columns(sheet: object, bounds: tuple[int, int]) -> None:
    """Widen only columns whose printable, non-merged text needs more room."""
    columns = sheet.getColumns()
    first_column, last_column = bounds
    print_areas = list(sheet.getPrintAreas())
    content_ranges = sheet.queryContentCells(CONTENT_CELL_FLAGS)
    required_widths: dict[int, int] = {}
    wrap_cells: set[tuple[int, int]] = set()
    diagnostic(
        "fit_content_columns called sheet=%r bounds=%s print_areas=%s content_range_count=%d",
        sheet.Name, bounds, print_area_tuples(sheet), content_ranges.getCount(),
    )
    for range_index in range(content_ranges.getCount()):
        address = content_ranges.getByIndex(range_index).getRangeAddress()
        start_col = max(first_column, int(address.StartColumn))
        end_col = min(last_column, int(address.EndColumn))
        for row in range(int(address.StartRow), int(address.EndRow) + 1):
            for column_index in range(start_col, end_col + 1):
                if not cell_in_print_areas(column_index, row, print_areas):
                    continue
                cell = sheet.getCellByPosition(column_index, row)
                text = cell.getString().strip()
                if not text:
                    continue
                cursor = sheet.createCursorByRange(cell)
                if cursor.getIsMerged():
                    continue
                try:
                    font_points = float(cell.getPropertyValue("CharHeight"))
                except Exception as exc:
                    font_points = 10.0
                    diagnostic(
                        "ordinary-cell font-height fallback sheet=%r cell=(%d,%d) error=%s: %s",
                        sheet.Name, column_index, row, type(exc).__name__, exc,
                    )
                raw_needed = estimated_text_width(text, font_points)
                needed = min(raw_needed, MAX_CELL_TEXT_WIDTH)
                if raw_needed > MAX_CELL_TEXT_WIDTH:
                    wrap_cells.add((column_index, row))
                required_widths[column_index] = max(
                    required_widths.get(column_index, 0), needed
                )

    for column_index, needed in sorted(required_widths.items()):
        column = columns.getByIndex(column_index)
        before = int(column.Width)
        if needed <= before:
            continue
        # Extremely long non-merged values wrap within a printable page
        # instead of widening the entire sheet beyond a usable scale.
        for wrap_column, row in wrap_cells:
            if wrap_column != column_index:
                continue
            cell = sheet.getCellByPosition(wrap_column, row)
            set_verified_properties(cell, (("IsTextWrapped", True),))
            row_range = sheet.getRows().getByIndex(row)
            set_verified_properties(row_range, (("OptimalHeight", True),))
            set_verified_properties(row_range, (("OptimalHeight", False),))
        set_manual_column_width(sheet, column_index, column, needed)


def fit_merged_text(sheet: object, bounds: tuple[int, int]) -> None:
    """Give populated merged cells enough combined width to avoid clipping.

    Calc's optimal-column-width calculation does not reliably account for
    merged cells. Widen only columns within the merged range in the temporary
    in-memory document. Existing merge definitions and cell formatting stay
    intact, and sheet print-area coordinates are not changed.
    """
    first_column, last_column = bounds
    content_ranges = sheet.queryContentCells(CONTENT_CELL_FLAGS)
    processed: set[tuple[int, int, int, int]] = set()
    columns = sheet.getColumns()
    print_areas = list(sheet.getPrintAreas())
    diagnostic(
        "fit_merged_text called sheet=%r bounds=%s content_range_count=%d",
        sheet.Name, bounds, content_ranges.getCount(),
    )

    for range_index in range(content_ranges.getCount()):
        content_range = content_ranges.getByIndex(range_index)
        address = content_range.getRangeAddress()
        for row in range(address.StartRow, address.EndRow + 1):
            for column_index in range(address.StartColumn, address.EndColumn + 1):
                cell = sheet.getCellByPosition(column_index, row)
                text = cell.getString().strip()
                if not text:
                    continue

                cursor = sheet.createCursorByRange(cell)
                is_merged = bool(cursor.getIsMerged())
                diagnostic(
                    "merged-cell probe sheet=%r cell=(%d,%d) cursor_range=%s is_merged=%s",
                    sheet.Name, column_index, row, address_tuple(cursor.getRangeAddress()),
                    is_merged,
                )
                if not is_merged:
                    continue
                original = cursor.getRangeAddress()
                cursor.collapseToMergedArea()
                merged = cursor.getRangeAddress()
                if (
                    merged.StartColumn == original.StartColumn
                    and merged.StartRow == original.StartRow
                    and merged.EndColumn == original.EndColumn
                    and merged.EndRow == original.EndRow
                ):
                    continue
                key = (
                    merged.StartColumn,
                    merged.StartRow,
                    merged.EndColumn,
                    merged.EndRow,
                )
                if print_areas and not cell_in_print_areas(
                    int(merged.StartColumn), int(merged.StartRow), print_areas
                ):
                    diagnostic("merged range outside explicit print areas skipped range=%s", key)
                    continue
                if key in processed:
                    continue
                processed.add(key)

                merged_text = sheet.getCellByPosition(
                    merged.StartColumn, merged.StartRow
                ).getString().strip()
                if not merged_text:
                    continue

                span_start = max(first_column, merged.StartColumn)
                span_end = min(last_column, merged.EndColumn)
                if span_end < span_start:
                    continue
                span_columns = [
                    columns.getByIndex(index)
                    for index in range(span_start, span_end + 1)
                ]
                current_width = sum(int(column.Width) for column in span_columns)
                try:
                    font_points = float(cell.getPropertyValue("CharHeight"))
                except Exception as exc:
                    font_points = 10.0
                    diagnostic(
                        "merged font-height lookup fallback range=%s error=%s: %s",
                        key, type(exc).__name__, exc,
                    )
                # Deliberately use a generous average glyph width so bold or
                # wide fonts do not stop at a visibly truncated final word.
                required_width = int(len(merged_text) * font_points * 30 + 500)
                target_width = min(required_width, MAX_MERGED_TEXT_WIDTH)
                diagnostic(
                    "merged range=%s text_length=%d source_width=%d estimated_width=%d target_width=%d",
                    key, len(merged_text), current_width, required_width, target_width,
                )

                if required_width > MAX_MERGED_TEXT_WIDTH:
                    # For unusually long merged labels, wrap within printable
                    # A4 width instead of making fit-to-width shrink the whole
                    # worksheet to an unreadable scale.
                    set_verified_properties(cell, (("IsTextWrapped", True),))
                    row = sheet.getRows().getByIndex(merged.StartRow)
                    set_verified_properties(row, (("OptimalHeight", True),))
                    set_verified_properties(row, (("OptimalHeight", False),))
                if target_width <= current_width:
                    continue

                extra_width = target_width - current_width
                per_column = extra_width // len(span_columns)
                remainder = extra_width % len(span_columns)
                for offset, column in enumerate(span_columns):
                    column_index = span_start + offset
                    set_manual_column_width(
                        sheet,
                        column_index,
                        column,
                        int(column.Width) + per_column + int(offset < remainder),
                    )
                final_width = sum(int(column.Width) for column in span_columns)
                if final_width < target_width:
                    raise RuntimeError(
                        f"Calc did not retain merged width for sheet {sheet.Name!r}, "
                        f"range {key}: target {target_width}, read back {final_width}"
                    )
                diagnostic(
                    "merged range=%s final_column_widths=%s final_width=%d",
                    key, [int(column.Width) for column in span_columns],
                    final_width,
                )


def configure_sheet(
    document: object,
    sheet: object,
    sheet_index: int,
    bounds: tuple[int, int],
    assignments: dict[tuple[str, bool], str],
) -> None:
    styles = document.getStyleFamilies().getByName("PageStyles")
    source_name = sheet.PageStyle
    source = styles.getByName(source_name)
    first_column, last_column = bounds
    diagnostic(
        "layout call sheet=%r index=%d used_bounds=%s print_areas=%s source_page_style=%r source_style=%s widths_before=%s",
        sheet.Name, sheet_index, used_range_tuple(sheet), print_area_tuples(sheet),
        source_name, page_style_state(document, source_name),
        [int(sheet.getColumns().getByIndex(index).Width) for index in range(first_column, last_column + 1)],
    )
    fit_content_columns(sheet, bounds)
    fit_merged_text(sheet, bounds)
    columns = sheet.getColumns()
    used_width = sum(
        columns.getByIndex(index).Width
        for index in range(first_column, last_column + 1)
    )
    portrait_usable = PORTRAIT_A4_WIDTH - int(source.LeftMargin) - int(source.RightMargin)
    landscape = used_width > portrait_usable
    diagnostic(
        "layout widths complete sheet=%r widths_after=%s used_width=%d portrait_usable=%d orientation=%s",
        sheet.Name,
        [int(columns.getByIndex(index).Width) for index in range(first_column, last_column + 1)],
        used_width, portrait_usable, "landscape" if landscape else "portrait",
    )
    key = (source_name, landscape)

    if key in assignments:
        style_name = assignments[key]
        set_verified_properties(sheet, (("PageStyle", style_name),))
        page_style = styles.getByName(style_name)
    elif not any(existing_name == source_name for existing_name, _ in assignments):
        # Keep the original page style for the first orientation encountered.
        style_name = source_name
        page_style = source
        assignments[key] = style_name
    else:
        orientation_name = "Landscape" if landscape else "Portrait"
        style_name = f"PDFConverter_{sheet_index}_{orientation_name}"
        while styles.hasByName(style_name):
            style_name += "_"
        page_style = clone_page_style(document, source, style_name)
        set_verified_properties(sheet, (("PageStyle", style_name),))
        assignments[key] = style_name

    # Calc page styles expose A4 through dimensions rather than PaperFormat.
    # Set orientation first, then explicit A4 dimensions to avoid relying on
    # orientation side effects to swap page width and height.
    width, height = (29700, 21000) if landscape else (21000, 29700)
    set_verified_properties(
        page_style,
        (
            # Clear legacy total-page/percent modes first. The fit-width mode
            # properties are applied last so they remain authoritative.
            ("ScaleToPages", 0),
            ("PageScale", 100),
            ("IsLandscape", landscape),
            ("Width", width),
            ("Height", height),
            ("ScaleToPagesX", 1),
            ("ScaleToPagesY", 0),
        ),
    )
    diagnostic(
        "layout final sheet=%r page_style=%r style_state=%s print_areas=%s widths=%s optimal_widths=%s",
        sheet.Name, sheet.PageStyle, page_style_state(document, sheet.PageStyle),
        print_area_tuples(sheet),
        [int(columns.getByIndex(index).Width) for index in range(first_column, last_column + 1)],
        [bool(columns.getByIndex(index).getPropertyValue("OptimalWidth")) for index in range(first_column, last_column + 1)],
    )


def main() -> int:
    if len(sys.argv) != 4:
        print("Expected source path, PDF output path, and UNO port.", file=sys.stderr)
        return 2
    source_path, output_path, port_text = sys.argv[1:]
    local_context = uno.getComponentContext()
    resolver = local_context.ServiceManager.createInstanceWithContext(
        "com.sun.star.bridge.UnoUrlResolver", local_context
    )
    context = None
    last_connection_error = None
    deadline = time.monotonic() + 25
    while context is None and time.monotonic() < deadline:
        try:
            context = resolver.resolve(
                "uno:socket,host=127.0.0.1,port="
                + port_text
                + ";urp;StarOffice.ComponentContext"
            )
        except Exception as exc:
            last_connection_error = exc
            time.sleep(0.1)
    if context is None:
        if last_connection_error is None:
            print("UNO connection did not become ready before timeout.", file=sys.stderr)
        else:
            print(
                "UNO connection failed after retries: "
                + type(last_connection_error).__name__
                + ": "
                + str(last_connection_error),
                file=sys.stderr,
            )
        return 3

    desktop = context.ServiceManager.createInstanceWithContext(
        "com.sun.star.frame.Desktop", context
    )
    document = desktop.loadComponentFromURL(
        uno.systemPathToFileUrl(source_path),
        "_blank",
        0,
        (
            property_value("Hidden", True),
            # The input is a disposable job-local copy. Only the PDF is exported.
            property_value("ReadOnly", False),
            property_value("UpdateDocMode", 3),
            property_value("MacroExecutionMode", 0),
        ),
    )
    if document is None:
        print("LibreOffice returned no document while opening the spreadsheet.", file=sys.stderr)
        return 4

    try:
        try:
            document_readonly = bool(document.isReadonly())
        except Exception as exc:
            document_readonly = f"unavailable:{type(exc).__name__}"
        diagnostic(
            "document opened source=%r document_url=%r is_readonly=%s",
            Path(source_path).name, document.getURL(), document_readonly,
        )
        sheets = document.getSheets()
        assignments: dict[tuple[str, bool], str] = {}
        sheet_names = sheets.getElementNames()
        has_any_print_area = any(
            sheets.getByName(sheet_name).IsVisible
            and bool(sheets.getByName(sheet_name).getPrintAreas())
            for sheet_name in sheet_names
        )
        for index, sheet_name in enumerate(sheet_names):
            sheet = sheets.getByName(sheet_name)
            diagnostic(
                "sheet discovered name=%r visible=%s print_areas=%s automatic_print_area=%s page_style=%r used_range=%s",
                sheet_name, bool(sheet.IsVisible), print_area_tuples(sheet),
                bool(sheet.AutomaticPrintArea), sheet.PageStyle, used_range_tuple(sheet),
            )
            if not sheet.IsVisible:
                continue
            if has_any_print_area and not sheet.getPrintAreas():
                # LibreOffice otherwise omits sheets without explicit print
                # areas when another sheet defines one; ask it to print this
                # sheet's used range without changing existing print areas.
                set_verified_properties(sheet, (("AutomaticPrintArea", True),))
                diagnostic(
                    "automatic print area enabled sheet=%r value=%s",
                    sheet_name, bool(sheet.AutomaticPrintArea),
                )
            bounds = used_column_bounds(sheet)
            diagnostic(
                "sheet bounds sheet=%r bounds=%s print_areas=%s",
                sheet_name, bounds, print_area_tuples(sheet),
            )
            if bounds is not None:
                configure_sheet(document, sheet, index, bounds, assignments)

        diagnostic(
            "calculation state before export: calculateAll invoked=false; layout properties applied synchronously"
        )
        diagnostic(
            "export begin filter=calc_pdf_Export options=%s output=%r styles=%s",
            {"Overwrite": True}, Path(output_path).name, assignments,
        )
        document.storeToURL(
            uno.systemPathToFileUrl(output_path),
            (
                property_value("FilterName", "calc_pdf_Export"),
                property_value("Overwrite", True),
            ),
        )
        diagnostic(
            "export complete output_exists=%s output_bytes=%s",
            Path(output_path).is_file(),
            Path(output_path).stat().st_size if Path(output_path).is_file() else 0,
        )
    finally:
        document.close(True)
    return 0


if __name__ == "__main__":
    try:
        exit_code = main()
    except Exception as exc:
        print(f"Calc UNO export failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        exit_code = 10
    raise SystemExit(exit_code)
