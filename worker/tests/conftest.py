from __future__ import annotations

import os
import shutil
import subprocess
import uuid
from pathlib import Path

import openpyxl
import pytest
from docx import Document
from openpyxl.styles import Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from pptx import Presentation
from pptx.util import Inches, Pt


os.environ.setdefault("CONVERSION_WORKER_TOKEN", "test-only-worker-token-that-is-long-enough-32chars")

WORD_MARKER = "PDFCONV_WORD_FIXTURE_MARKER"
EXCEL_MARKER = "PDFCONV_EXCEL_FIXTURE_MARKER"
PRESENTATION_MARKER = "PDFCONV_PRESENTATION_FIXTURE_MARKER"
TEXT_MARKER = "PDFCONV_TEXT_FIXTURE_MARKER"
RTF_MARKER = "PDFCONV_RTF_FIXTURE_MARKER"


def _convert_with_soffice(source: Path, target_extension: str, destination: Path) -> Path:
    profile = destination / ("lo-fixture-profile-" + uuid.uuid4().hex)
    profile.mkdir()
    command = [
        "soffice",
        "--headless",
        "--nologo",
        "--nodefault",
        "--nolockcheck",
        "--norestore",
        f"-env:UserInstallation={profile.as_uri()}",
        "--convert-to",
        target_extension,
        "--outdir",
        str(destination),
        str(source),
    ]
    result = subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
    output = destination / (source.stem + "." + target_extension)
    if result.returncode != 0 or not output.is_file():
        raise RuntimeError(f"LibreOffice could not create the {target_extension} fixture")
    return output


@pytest.fixture(scope="session")
def source_fixtures(tmp_path_factory: pytest.TempPathFactory) -> dict[str, Path]:
    root = tmp_path_factory.mktemp("real-office-fixtures")
    raw = root / "raw"
    raw.mkdir()
    converted = root / "converted"
    converted.mkdir()

    word_path = raw / "word-source.docx"
    word = Document()
    word.add_heading("Worker conversion fixture", level=1)
    word.add_paragraph(WORD_MARKER)
    word.save(word_path)

    spreadsheet_path = raw / "spreadsheet-source.xlsx"
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Fixture"
    sheet.append([EXCEL_MARKER, "42"])
    sheet.column_dimensions["A"].width = 42
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    sheet.page_setup.fitToWidth = 1
    sheet.page_setup.fitToHeight = 1
    workbook.save(spreadsheet_path)

    wide_workbook_path = raw / "wide-layout.xlsx"
    wide_workbook = openpyxl.Workbook()
    wide_sheet = wide_workbook.active
    wide_sheet.title = "Wide report"
    for column in range(1, 15):
        wide_sheet.cell(1, column, f"WIDE_COL_{column:02d}")
        wide_sheet.cell(2, column, f"WIDE_VALUE_{column:02d}")
        wide_sheet.column_dimensions[get_column_letter(column)].width = 24
    wide_sheet.print_area = "A1:N2"
    wide_sheet.page_setup.orientation = "portrait"
    wide_sheet.page_setup.paperSize = wide_sheet.PAPERSIZE_LETTER
    wide_workbook.save(wide_workbook_path)

    tall_workbook_path = raw / "tall-layout.xlsx"
    tall_workbook = openpyxl.Workbook()
    tall_sheet = tall_workbook.active
    tall_sheet.title = "Tall report"
    for row in range(1, 181):
        tall_sheet.append([f"TALL_ROW_{row:03d}", row, "Repeated vertical page test"])
    tall_workbook.save(tall_workbook_path)

    multi_workbook_path = raw / "multi-sheet-layout.xlsx"
    multi_workbook = openpyxl.Workbook()
    narrow_sheet = multi_workbook.active
    narrow_sheet.title = "Portrait sheet"
    narrow_sheet.append(["MULTI_PORTRAIT_MARKER", "Column B", "Column C"])
    narrow_sheet.append(["Short value", "More", "Text"])
    narrow_sheet["A10"] = "OUTSIDE_PRINT_AREA_SHOULD_NOT_APPEAR"
    narrow_sheet.print_area = "A1:C2"
    wide_multi_sheet = multi_workbook.create_sheet("Landscape sheet")
    for column in range(1, 13):
        wide_multi_sheet.cell(1, column, f"MULTI_WIDE_{column:02d}")
        wide_multi_sheet.cell(2, column, f"Value {column}")
        wide_multi_sheet.column_dimensions[get_column_letter(column)].width = 25
    wide_multi_sheet.cell(3, 1, "MULTI_LANDSCAPE_MARKER")
    multi_workbook.save(multi_workbook_path)

    merged_workbook_path = raw / "merged-formatting.xlsx"
    merged_workbook = openpyxl.Workbook()
    merged_sheet = merged_workbook.active
    merged_sheet.title = "Formatted cells"
    merged_sheet.merge_cells("A1:D1")
    merged_title = merged_sheet["A1"]
    merged_title.value = "MERGED_FORMATTING_MARKER"
    merged_title.font = Font(name="Arial", size=16, bold=True, color="FFFFFF")
    merged_title.fill = PatternFill(fill_type="solid", fgColor="1F4E78")
    edge = Side(style="thin", color="000000")
    merged_title.border = Border(left=edge, right=edge, top=edge, bottom=edge)
    merged_sheet.append(["Styled data", 12, "Blue fill and borders", "End"])
    merged_sheet["A2"].fill = PatternFill(fill_type="solid", fgColor="D9EAF7")
    merged_sheet["A2"].border = Border(left=edge, right=edge, top=edge, bottom=edge)
    merged_sheet["A2"].font = Font(bold=True, color="17365D")
    merged_workbook.save(merged_workbook_path)

    presentation_path = raw / "presentation-source.pptx"
    presentation = Presentation()
    slide = presentation.slides.add_slide(presentation.slide_layouts[6])
    textbox = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(2))
    paragraph = textbox.text_frame.paragraphs[0]
    paragraph.text = PRESENTATION_MARKER
    paragraph.font.size = Pt(24)
    presentation.save(presentation_path)

    text_path = raw / "text-source.txt"
    text_path.write_text(TEXT_MARKER + "\nA second printable line.\n", encoding="utf-8")
    rtf_path = raw / "rich-text-source.rtf"
    rtf_path.write_text(
        r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Liberation Sans;}}\f0\fs24 "
        + RTF_MARKER
        + r"\par A second rich text line.}",
        encoding="ascii",
    )

    fixtures = {
        "docx": word_path,
        "doc": _convert_with_soffice(word_path, "doc", converted),
        "odt": _convert_with_soffice(word_path, "odt", converted),
        "xlsx": spreadsheet_path,
        "xls": _convert_with_soffice(spreadsheet_path, "xls", converted),
        "ods": _convert_with_soffice(spreadsheet_path, "ods", converted),
        "pptx": presentation_path,
        "ppt": _convert_with_soffice(presentation_path, "ppt", converted),
        "odp": _convert_with_soffice(presentation_path, "odp", converted),
        "rtf": rtf_path,
        "txt": text_path,
        "wide_xlsx": wide_workbook_path,
        "wide_xls": _convert_with_soffice(wide_workbook_path, "xls", converted),
        "wide_ods": _convert_with_soffice(wide_workbook_path, "ods", converted),
        "tall_xlsx": tall_workbook_path,
        "multi_xlsx": multi_workbook_path,
        "merged_xlsx": merged_workbook_path,
    }
    _convert_with_soffice(text_path, "pdf", converted)
    fixtures["sample_pdf"] = converted / "text-source.pdf"
    if not shutil.which("soffice") or not fixtures["sample_pdf"].is_file():
        raise RuntimeError("LibreOffice-generated PDF fixture is unavailable")
    return fixtures
