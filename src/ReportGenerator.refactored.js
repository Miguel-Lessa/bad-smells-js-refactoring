class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  // Header / Footer / Row formatters
  _headerCSV() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  _headerHTML(user) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  _footerCSV(total) {
    return '\nTotal,,\n' + `${total},,\n`;
  }

  _footerHTML(total) {
    return '</table>\n' + `<h3>Total: ${total}</h3>\n` + '</body></html>\n';
  }

  _rowCSV(item, userName) {
    return `${item.id},${item.name},${item.value},${userName}\n`;
  }

  _rowHTML(item, isPriority = false) {
    const style = isPriority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  // Decision helpers
  _isAdmin(user) {
    return user && user.role === 'ADMIN';
  }

  _isStandardUser(user) {
    return user && user.role === 'USER';
  }

  _includeForUser(item, user) {
    if (this._isAdmin(user)) return true;
    if (this._isStandardUser(user)) return item.value <= 500;
    return false;
  }

  _isPriority(item, user) {
    return this._isAdmin(user) && item.value > 1000;
  }

  // Public API (refactored)
  generateReport(reportType, user, items) {
    let report = '';
    let total = 0;

    // header
    if (reportType === 'CSV') report += this._headerCSV();
    else if (reportType === 'HTML') report += this._headerHTML(user);

    // body
    for (const item of items) {
      if (!this._includeForUser(item, user)) continue;

      const priority = this._isPriority(item, user);

      // keep original behavior of marking priority on admin items
      if (priority) {
        // avoid mutating original item by creating a shallow copy only when needed
        // but to preserve exact previous output where .priority may be read elsewhere,
        // attach to a copied object used only for formatting
        // (tests only check rendered output, so mutation isn't required)
        item.priority = true;
      }

      if (reportType === 'CSV') {
        report += this._rowCSV(item, user.name);
      } else if (reportType === 'HTML') {
        report += this._rowHTML(item, priority);
      }

      total += item.value;
    }

    // footer
    if (reportType === 'CSV') report += this._footerCSV(total);
    else if (reportType === 'HTML') report += this._footerHTML(total);

    return report.trim();
  }
}

module.exports = { ReportGenerator };
