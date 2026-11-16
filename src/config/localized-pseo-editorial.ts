import type { PseoModifier } from './tools-registry';

export interface LocalizedPseoEditorial {
  intro: string;
  heading: string;
  stepsHeading: string;
  steps: { title: string; description: string }[];
  outputHeading: string;
  output: string;
  limitationsHeading: string;
  limitations: string;
  faqAnswerOverrides?: Record<string, string>;
  relatedLink?: { href: string; label: string };
}

type EditorialKey = `${'de' | 'fr'}:${string}:${PseoModifier}`;

const editorial: Partial<Record<EditorialKey, LocalizedPseoEditorial>> = {
  'de:pdf-to-jpg:for-windows': {
    intro: 'Wandeln Sie PDF-Seiten unter Windows im Browser in JPG-Bilder um. Wählen Sie die PDF-Datei über den Dateidialog aus; das Werkzeug rendert alle Seiten und erstellt den passenden Download.',
    heading: 'PDF unter Windows in JPG umwandeln',
    stepsHeading: 'So funktioniert die Umwandlung',
    steps: [
      { title: 'PDF auswählen', description: 'Öffnen Sie den Dateidialog und wählen Sie eine PDF-Datei mit höchstens 25 MB aus.' },
      { title: 'Umwandlung starten', description: 'Lassen Sie den Browser die vollständigen Seiten der PDF nacheinander als JPG rendern.' },
      { title: 'Ergebnis herunterladen', description: 'Laden Sie das einzelne JPG oder bei mehreren Seiten die ZIP-Datei mit den einzelnen Bildern herunter.' },
    ],
    outputHeading: 'Was Sie erhalten',
    output: 'Eine einseitige PDF ergibt ein JPG. Bei mehreren Seiten enthält eine ZIP-Datei ein JPG pro Seite. Die Ausgabe wird mit einer kombinierten Grenze von 40 Megapixeln gerendert.',
    limitationsHeading: 'Grenzen und Hinweise',
    limitations: 'Die Datei muss im PDF-Format vorliegen und darf höchstens 25 MB groß sein. Es gibt keine Auswahl einzelner Seiten: Alle Seiten werden verarbeitet. Windows benötigt dafür keine separate Converter-App; die Umwandlung läuft in diesem Browser-Tab.',
    relatedLink: { href: '/de/p/pdf-to-png-fuer-windows', label: 'PDF-Seiten unter Windows als PNG ausgeben' },
  },
  'de:merge-pdf:for-windows': {
    intro: 'Führen Sie unter Windows mehrere PDF-Dateien im Browser zu einem Dokument zusammen. Die Seitenfolge richtet sich nach der Dateiliste, die der Browser übergibt. Der Dateidialog bestimmt diese Reihenfolge; sie muss nicht der Reihenfolge entsprechen, in der Sie Dateien auswählen.',
    heading: 'PDF-Dateien unter Windows zusammenführen',
    stepsHeading: 'So führen Sie PDFs zusammen',
    steps: [
      { title: 'Dateien auswählen', description: 'Wählen Sie im Dateidialog mindestens zwei und höchstens 20 PDF-Dateien aus.' },
      { title: 'Dateireihenfolge beachten', description: 'Die Ausgabe übernimmt die Reihenfolge der Browser-Dateiliste. Die Reihenfolge, in der Sie Dateien im Windows-Dateidialog auswählen, ist nicht garantiert; manuelles Umsortieren ist auf der Seite nicht möglich.' },
      { title: 'Zusammenführen und speichern', description: 'Starten Sie den Vorgang und laden Sie das erzeugte PDF-Dokument herunter.' },
    ],
    outputHeading: 'Aufbau der Ausgabe',
    output: 'Das Ergebnis ist eine einzelne PDF-Datei. Die Seiten jeder Eingabedatei werden vollständig kopiert und in der Reihenfolge angehängt, in der die Dateien in der Browser-Dateiliste stehen. Diese muss nicht der Auswahlreihenfolge entsprechen.',
    limitationsHeading: 'Grenzen und Hinweise',
    limitations: 'Es sind 2 bis 20 PDF-Dateien möglich; jede Datei darf höchstens 25 MB groß sein. Die Reihenfolge der Ausgabe folgt der vom Browser übergebenen Dateiliste und ist nicht verlässlich über die Klickreihenfolge im Dateidialog steuerbar. Nach der Auswahl gibt es keine manuelle Sortier- oder Drag-and-drop-Funktion. Die Verarbeitung erfolgt im Browser, eine Windows-App ist dafür nicht erforderlich.',
    faqAnswerOverrides: {
      'Wie viele PDFs kann ich gleichzeitig zusammenführen?': 'Wählen Sie 2 bis 20 PDFs mit jeweils höchstens 25 MB aus. Die Ausgabe folgt der Reihenfolge in der Browser-Dateiliste. Diese Reihenfolge kann vom Dateidialog abhängen und ist nicht garantiert identisch mit der Reihenfolge, in der Sie die Dateien auswählen. Nach der Auswahl gibt es keine manuelle Sortierfunktion.',
    },
    relatedLink: { href: '/de/p/merge-pdf-auf-dem-iphone', label: 'PDF-Dateien auf dem iPhone zusammenführen' },
  },
  'de:merge-pdf:on-iphone': {
    intro: 'Führen Sie PDF-Dateien auf dem iPhone über den Browser zusammen. Die Ausgabe folgt der Dateiliste, die der Browser aus dem iOS-Dateidialog erhält. Deren Reihenfolge kann vom Dateidialog und Browser abhängen und muss nicht der Reihenfolge Ihrer Auswahl entsprechen.',
    heading: 'PDF-Dateien auf dem iPhone zusammenführen',
    stepsHeading: 'So funktioniert es auf dem iPhone',
    steps: [
      { title: 'PDFs im Dateidialog auswählen', description: 'Öffnen Sie die Dateiauswahl des Browsers und wählen Sie mindestens zwei unterstützte PDF-Dateien aus.' },
      { title: 'Dateireihenfolge berücksichtigen', description: 'Die Zusammenführung folgt der vom Browser gemeldeten Dateiliste. Die Reihenfolge, in der Sie Dateien antippen, ist nicht garantiert; nach der Auswahl gibt es keine manuelle Sortierfunktion.' },
      { title: 'Zusammenführen und herunterladen', description: 'Starten Sie die Verarbeitung und nutzen Sie die Downloadsteuerung Ihres Browsers, um das eine Ergebnis-PDF zu öffnen oder zu speichern.' },
    ],
    outputHeading: 'Ergebnis',
    output: 'Die Seiten der PDFs werden in der Reihenfolge zusammengefügt, in der die Dateien in der Browser-Dateiliste stehen. Das Ergebnis ist eine einzelne PDF-Datei; die Dateilisten-Reihenfolge muss nicht der Tipp-Reihenfolge entsprechen.',
    limitationsHeading: 'Grenzen und Hinweise',
    limitations: 'Sie können 2 bis 20 PDFs mit jeweils höchstens 25 MB verwenden. Die Reihenfolge wird vom Browser anhand seiner Dateiliste übernommen; eine bestimmte Tipp- oder Auswahlreihenfolge ist nicht garantiert. Eine manuelle Sortierfunktion nach der Auswahl gibt es nicht. Welche Speicherorte angeboten werden und wie der Download erscheint, richtet sich nach iOS, Browser und Dateiauswahl.',
    faqAnswerOverrides: {
      'Wie viele PDFs kann ich gleichzeitig zusammenführen?': 'Wählen Sie 2 bis 20 PDFs mit jeweils höchstens 25 MB aus. Die Ausgabe folgt der Reihenfolge in der Browser-Dateiliste. Diese kann vom iOS-Dateidialog oder Browser abhängen und muss nicht der Reihenfolge entsprechen, in der Sie Dateien antippen. Nach der Auswahl können Sie die Reihenfolge nicht manuell ändern.',
    },
    relatedLink: { href: '/de/p/merge-pdf-fuer-windows', label: 'PDF-Dateien unter Windows zusammenführen' },
  },
  'fr:merge-pdf:on-iphone': {
    intro: 'Fusionnez plusieurs PDF sur iPhone depuis votre navigateur. Le résultat suit l’ordre de la liste de fichiers fournie par le navigateur à partir du sélecteur iOS. Cet ordre dépend du sélecteur et du navigateur et ne correspond pas nécessairement à l’ordre dans lequel vous touchez les fichiers.',
    heading: 'Fusionner des fichiers PDF sur iPhone',
    stepsHeading: 'Étapes sur iPhone',
    steps: [
      { title: 'Choisir les PDF', description: 'Ouvrez le sélecteur de fichiers du navigateur et sélectionnez au moins deux fichiers PDF compatibles.' },
      { title: 'Tenir compte de l’ordre des fichiers', description: 'La fusion suit l’ordre de la liste transmise par le navigateur. L’ordre dans lequel vous touchez les fichiers n’est pas garanti; la page ne permet pas de les réorganiser manuellement après la sélection.' },
      { title: 'Lancer la fusion et récupérer le résultat', description: 'Démarrez le traitement, puis utilisez les commandes de téléchargement du navigateur pour ouvrir ou enregistrer le PDF obtenu.' },
    ],
    outputHeading: 'Résultat obtenu',
    output: 'Les pages des documents sont réunies dans l’ordre de la liste de fichiers transmise par le navigateur. Cet ordre peut différer de celui dans lequel vous avez touché les fichiers. Le résultat est un seul fichier PDF.',
    limitationsHeading: 'Limites et conseils',
    limitations: 'La fusion accepte de 2 à 20 PDF, avec une taille maximale de 25 Mo par fichier. L’ordre dépend de la liste renvoyée par le navigateur; l’ordre des touchers ou de la sélection n’est pas garanti. L’outil ne permet pas de modifier manuellement cet ordre après la sélection. Les emplacements accessibles et la présentation du téléchargement dépendent d’iOS, du navigateur et du sélecteur de fichiers.',
    faqAnswerOverrides: {
      'Combien de PDF puis-je fusionner à la fois ?': 'Sélectionnez de 2 à 20 PDF, jusqu’à 25 Mo par fichier. Le résultat suit l’ordre de la liste de fichiers transmise par le navigateur. Le sélecteur iOS ou le navigateur peut déterminer cet ordre; il n’est pas garanti qu’il corresponde à l’ordre dans lequel vous touchez les fichiers. L’outil ne permet pas de réorganiser manuellement les fichiers après la sélection.',
    },
    relatedLink: { href: '/fr/p/merge-pdf-sur-windows', label: 'Fusionner des PDF sur Windows' },
  },
};

export function getLocalizedPseoEditorial(
  locale: string,
  toolSlug: string,
  modifier: PseoModifier,
): LocalizedPseoEditorial | undefined {
  if (locale !== 'de' && locale !== 'fr') return undefined;
  return editorial[`${locale}:${toolSlug}:${modifier}` as EditorialKey];
}

export const LOCALIZED_PSEO_EDITORIAL_PATHS = [
  '/de/p/pdf-to-jpg-fuer-windows',
  '/de/p/merge-pdf-fuer-windows',
  '/de/p/merge-pdf-auf-dem-iphone',
  '/fr/p/merge-pdf-sur-iphone',
] as const;
