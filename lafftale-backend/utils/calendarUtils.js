/**
 * Kalenderfunktionen für Datumsberechnungen
 * Unterstützt korrekte Monatsberechnung mit Schaltjahren
 */

class CalendarUtils {
  /**
   * Gibt den ersten Tag des aktuellen Monats zurück
   * @returns {Date} Erster Tag des Monats um 00:00:00
   */
  static getCurrentMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  /**
   * Gibt den letzten Tag des aktuellen Monats zurück
   * @returns {Date} Letzter Tag des Monats um 23:59:59.999
   */
  static getCurrentMonthEnd() {
    const now = new Date();
    // Nächster Monat, Tag 0 = letzter Tag des aktuellen Monats
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59, 999);
  }

  /**
   * Gibt den ersten Tag eines bestimmten Monats zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {Date} Erster Tag des Monats um 00:00:00
   */
  static getMonthStart(year, month) {
    return new Date(year, month, 1, 0, 0, 0, 0);
  }

  /**
   * Gibt den letzten Tag eines bestimmten Monats zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {Date} Letzter Tag des Monats um 23:59:59.999
   */
  static getMonthEnd(year, month) {
    const lastDay = new Date(year, month + 1, 0);
    return new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59, 999);
  }

  /**
   * Prüft ob ein Jahr ein Schaltjahr ist
   * @param {number} year - Jahr zum Prüfen
   * @returns {boolean} True wenn Schaltjahr
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Gibt die Anzahl der Tage in einem Monat zurück
   * @param {number} year - Jahr
   * @param {number} month - Monat (0-11)
   * @returns {number} Anzahl Tage im Monat
   */
  static getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * Formatiert ein Datum für SQL Server DATETIME
   * @param {Date} date - Datum zum Formatieren
   * @returns {string} SQL-formatiertes Datum
   */
  static formatForSQL(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Gibt Informationen zum aktuellen Monat zurück
   * @returns {Object} Monatsinfo mit Start, Ende, Name, etc.
   */
  static getCurrentMonthInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];

    return {
      year,
      month: month + 1, // 1-basiert für Display
      monthName: monthNames[month],
      monthNameEn: now.toLocaleString('en', { month: 'long' }),
      start: this.getCurrentMonthStart(),
      end: this.getCurrentMonthEnd(),
      daysInMonth: this.getDaysInMonth(year, month),
      isLeapYear: this.isLeapYear(year),
      startSQL: this.formatForSQL(this.getCurrentMonthStart()),
      endSQL: this.formatForSQL(this.getCurrentMonthEnd()),
    };
  }

  /**
   * Erstellt SQL WHERE-Klausel für aktuellen Monat
   * @param {string} dateColumn - Name der Datumsspalte
   * @returns {string} SQL WHERE-Klausel
   */
  static getCurrentMonthSQLFilter(dateColumn = 'EventDate') {
    const monthInfo = this.getCurrentMonthInfo();
    return `${dateColumn} >= '${monthInfo.startSQL}' AND ${dateColumn} <= '${monthInfo.endSQL}'`;
  }

  /**
   * Debug-Informationen für aktuellen Monat
   * @returns {Object} Debug-Infos
   */
  static getDebugInfo() {
    const monthInfo = this.getCurrentMonthInfo();
    return {
      ...monthInfo,
      now: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sqlFilter: this.getCurrentMonthSQLFilter('EventDate'),
    };
  }
}

module.exports = CalendarUtils;
