/*! iepp v2.2 MIT/GPL2 @jon_neal & afarkas */
(function (e, t) {
  function y(e) {
    var t = -1;
    while (++t < s)e.createElement(i[t])
  }

  if (!window.attachEvent || !t.createStyleSheet || !function () {
    var e = document.createElement("div");
    return e.innerHTML = "<elem></elem>", e.childNodes.length !== 1
  }())return;
  e.iepp = e.iepp || {};
  var n = e.iepp, r = n.html5elements || "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|subline|summary|time|video", i = r.split("|"), s = i.length, o = new RegExp("(^|\\s)(" + r + ")", "gi"), u = new RegExp("<(/*)(" + r + ")", "gi"), a = /^\s*[\{\}]\s*$/, f = new RegExp("(^|[^\\n]*?\\s)(" + r + ")([^\\n]*)({[\\n\\w\\W]*?})", "gi"), l = /@media +(?![Print|All])[^{]+\{([^{}]+\{[^{}]+\})+[^}]+\}/g, c = t.createDocumentFragment(), h = t.documentElement, p = t.getElementsByTagName("script")[0].parentNode, d = t.createElement("body"), v = t.createElement("style"), m = /print|all/, g;
  n.getCSS = function (e, t) {
    try {
      if (e + "" === undefined)return""
    } catch (r) {
      return""
    }
    var i = -1, s = e.length, o, u, a = [];
    while (++i < s) {
      o = e[i];
      if (o.disabled)continue;
      t = o.media || t, m.test(t) && (u = o.cssText, t != "print" && (u = u.replace(l, "")), a.push(n.getCSS(o.imports, t), u)), t = "all"
    }
    return a.join("")
  }, n.parseCSS = function (e) {
    var t = [], n;
    while ((n = f.exec(e)) != null)t.push(((a.exec(n[1]) ? "\n" : n[1]) + n[2] + n[3]).replace(o, "$1.iepp-$2") + n[4]);
    return t.join("\n")
  }, n.writeHTML = function () {
    var e = -1;
    g = g || t.body;
    while (++e < s) {
      var n = t.getElementsByTagName(i[e]), r = n.length, o = -1;
      while (++o < r)n[o].className.indexOf("iepp-") < 0 && (n[o].className += " iepp-" + i[e])
    }
    c.appendChild(g), h.appendChild(d), d.className = g.className, d.id = g.id, d.innerHTML = g.innerHTML.replace(u, "<$1font")
  }, n._beforePrint = function () {
    if (n.disablePP)return;
    v.styleSheet.cssText = n.parseCSS(n.getCSS(t.styleSheets, "all")), n.writeHTML()
  }, n.restoreHTML = function () {
    if (n.disablePP)return;
    d.swapNode(g)
  }, n._afterPrint = function () {
    n.restoreHTML(), v.styleSheet.cssText = ""
  }, y(t), y(c);
  if (n.disablePP)return;
  p.insertBefore(v, p.firstChild), v.media = "print", v.className = "iepp-printshim", e.attachEvent("onbeforeprint", n._beforePrint), e.attachEvent("onafterprint", n._afterPrint)
})(this, document);