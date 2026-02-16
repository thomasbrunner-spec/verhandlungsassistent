export interface LIFOStyle {
  name: string;
  short: string;
  color: string;
  bg: string;
  traits: string;
  approach: string;
  doList: string[];
  dontList: string[];
  underPressure: string;
}

export const LIFO: Record<string, LIFOStyle> = {
  UH: {
    name: "Unterstützend/Hergebend (UH)",
    short: "UH",
    color: "#1565C0",
    bg: "#1565C012",
    traits: "Kooperativ, hilfsbereit, harmoniebedürftig, beziehungsorientiert, loyal, vermeidet Konflikte, serviceorientiert, stellt eigene Bedürfnisse zurück",
    approach: "Partnerschaft und gemeinsame Ziele betonen. Vertrauensvolle Atmosphäre schaffen. Aggressive Taktiken vermeiden. Wertschätzung für den Beitrag zeigen.",
    doList: ["Wertschätzung zeigen", "Gemeinsame Ziele betonen", "Beziehung pflegen", "Vertrauen aufbauen", "Win-Win hervorheben"],
    dontList: ["Aggressiv auftreten", "Ultimaten stellen", "Beziehungsebene ignorieren", "Unter Druck setzen", "Konfrontativ argumentieren"],
    underPressure: "Gibt zu schnell nach, kann sich nicht abgrenzen, wird übermäßig nachgiebig, opfert eigene Interessen für die Beziehung",
  },
  "BÜ": {
    name: "Bestimmend/Übernehmend (BÜ)",
    short: "BÜ",
    color: "#C62828",
    bg: "#C6282812",
    traits: "Durchsetzungsstark, ergebnisorientiert, direkt, ungeduldig, wettbewerbsorientiert, entscheidungsfreudig, kontrollierend, dominant",
    approach: "Schnell zum Punkt kommen. Klare Fakten und Ergebnisse präsentieren. Respekt für Kompetenz zeigen. Nicht unterordnen, aber auch nicht unnötig konfrontieren.",
    doList: ["Direkt und prägnant sein", "Ergebnisse in den Vordergrund", "Kompetenz zeigen", "Schnell zum Punkt kommen", "Klare Optionen bieten"],
    dontList: ["Lange Smalltalk-Phasen", "Unvorbereitet erscheinen", "Schwäche zeigen", "Zu viele Details", "Zögerlich wirken"],
    underPressure: "Wird dominant, kann übersteuern, hört nicht mehr zu, drängt auf schnelle Entscheidung, wird autoritär und einschüchternd",
  },
  AH: {
    name: "Anpassend/Harmonisierend (AH)",
    short: "AH",
    color: "#F57F17",
    bg: "#F57F1712",
    traits: "Flexibel, kreativ, enthusiastisch, spontan, ideenreich, networking-orientiert, anpassungsfähig, vermittelnd",
    approach: "Offen für neue Ideen sein. Positive, dynamische Atmosphäre schaffen. Zu starre Strukturen vermeiden. Raum für kreative Lösungen lassen.",
    doList: ["Offen für Ideen sein", "Positive Atmosphäre", "Flexibilität zeigen", "Kreative Lösungen", "Begeisterung teilen"],
    dontList: ["Zu starr vorgehen", "Kreativität einschränken", "Nur auf Zahlen fokussieren", "Langatmig präsentieren", "Begeisterung bremsen"],
    underPressure: "Wird unverbindlich, springt zwischen Themen, verliert Fokus, macht unrealistische Zugeständnisse, weicht aus",
  },
  BF: {
    name: "Bewahrend/Festhaltend (BF)",
    short: "BF",
    color: "#2E7D32",
    bg: "#2E7D3212",
    traits: "Analytisch, detailorientiert, strukturiert, vorsichtig, qualitätsbewusst, risikoavers, methodisch, faktenbasiert",
    approach: "Daten und Fakten liefern. Zeit für Analysen geben. Gut vorbereitet und strukturiert sein. Qualität und Sicherheit in den Vordergrund stellen.",
    doList: ["Daten und Fakten liefern", "Strukturiert vorgehen", "Zeit zum Nachdenken geben", "Qualität betonen", "Schriftliche Unterlagen"],
    dontList: ["Unvorbereitet sein", "Auf schnelle Entscheidung drängen", "Emotionale Argumente", "Details überspringen", "Ungeduld zeigen"],
    underPressure: "Blockiert, wird starr, verliert sich in Details, kann keine Entscheidung treffen, klammert sich an Bewährtes",
  },
};
