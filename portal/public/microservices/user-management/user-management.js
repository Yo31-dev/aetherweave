/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = globalThis, wt = et.ShadowRoot && (et.ShadyCSS === void 0 || et.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, At = Symbol(), It = /* @__PURE__ */ new WeakMap();
let Yt = class {
  constructor(t, e, r) {
    if (this._$cssResult$ = !0, r !== At) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (wt && t === void 0) {
      const r = e !== void 0 && e.length === 1;
      r && (t = It.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && It.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const pe = (o) => new Yt(typeof o == "string" ? o : o + "", void 0, At), E = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce(((r, i, s) => r + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[s + 1]), o[0]);
  return new Yt(e, o, At);
}, fe = (o, t) => {
  if (wt) o.adoptedStyleSheets = t.map(((e) => e instanceof CSSStyleSheet ? e : e.styleSheet));
  else for (const e of t) {
    const r = document.createElement("style"), i = et.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = e.cssText, o.appendChild(r);
  }
}, Rt = wt ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const r of t.cssRules) e += r.cssText;
  return pe(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: me, defineProperty: ve, getOwnPropertyDescriptor: be, getOwnPropertyNames: ge, getOwnPropertySymbols: ye, getPrototypeOf: _e } = Object, st = globalThis, Ut = st.trustedTypes, $e = Ut ? Ut.emptyScript : "", xe = st.reactiveElementPolyfillSupport, j = (o, t) => o, rt = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? $e : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, Ct = (o, t) => !me(o, t), Nt = { attribute: !0, type: String, converter: rt, reflect: !1, useDefault: !1, hasChanged: Ct };
Symbol.metadata ??= Symbol("metadata"), st.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Nt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(t, r, e);
      i !== void 0 && ve(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, r) {
    const { get: i, set: s } = be(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const l = i?.call(this);
      s?.call(this, n), this.requestUpdate(t, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Nt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(j("elementProperties"))) return;
    const t = _e(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(j("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(j("properties"))) {
      const e = this.properties, r = [...ge(e), ...ye(e)];
      for (const i of r) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [r, i] of e) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, r] of this.elementProperties) {
      const i = this._$Eu(e, r);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const i of r) e.unshift(Rt(i));
    } else t !== void 0 && e.push(Rt(t));
    return e;
  }
  static _$Eu(t, e) {
    const r = e.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise(((t) => this.enableUpdating = t)), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach(((t) => t(this)));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const r of e.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return fe(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach(((t) => t.hostConnected?.()));
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach(((t) => t.hostDisconnected?.()));
  }
  attributeChangedCallback(t, e, r) {
    this._$AK(t, r);
  }
  _$ET(t, e) {
    const r = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, r);
    if (i !== void 0 && r.reflect === !0) {
      const s = (r.converter?.toAttribute !== void 0 ? r.converter : rt).toAttribute(e, r.type);
      this._$Em = t, s == null ? this.removeAttribute(i) : this.setAttribute(i, s), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const r = this.constructor, i = r._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const s = r.getPropertyOptions(i), n = typeof s.converter == "function" ? { fromAttribute: s.converter } : s.converter?.fromAttribute !== void 0 ? s.converter : rt;
      this._$Em = i;
      const l = n.fromAttribute(e, s.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, r) {
    if (t !== void 0) {
      const i = this.constructor, s = this[t];
      if (r ??= i.getPropertyOptions(t), !((r.hasChanged ?? Ct)(s, e) || r.useDefault && r.reflect && s === this._$Ej?.get(t) && !this.hasAttribute(i._$Eu(t, r)))) return;
      this.C(t, e, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: r, reflect: i, wrapped: s }, n) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), s !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, s] of this._$Ep) this[i] = s;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, s] of r) {
        const { wrapped: n } = s, l = this[i];
        n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, s, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach(((r) => r.hostUpdate?.())), this.update(e)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach(((e) => e.hostUpdated?.())), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach(((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[j("elementProperties")] = /* @__PURE__ */ new Map(), D[j("finalized")] = /* @__PURE__ */ new Map(), xe?.({ ReactiveElement: D }), (st.reactiveElementVersions ??= []).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Et = globalThis, ot = Et.trustedTypes, zt = ot ? ot.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, Kt = "$lit$", O = `lit$${Math.random().toFixed(9).slice(2)}$`, Zt = "?" + O, we = `<${Zt}>`, z = document, q = () => z.createComment(""), W = (o) => o === null || typeof o != "object" && typeof o != "function", St = Array.isArray, Ae = (o) => St(o) || typeof o?.[Symbol.iterator] == "function", at = `[ 	
\f\r]`, F = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mt = /-->/g, Dt = />/g, U = RegExp(`>|${at}(?:([^\\s"'>=/]+)(${at}*=${at}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ht = /'/g, Bt = /"/g, Jt = /^(?:script|style|textarea|title)$/i, Ce = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), $ = Ce(1), k = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Ft = /* @__PURE__ */ new WeakMap(), N = z.createTreeWalker(z, 129);
function Xt(o, t) {
  if (!St(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return zt !== void 0 ? zt.createHTML(t) : t;
}
const Ee = (o, t) => {
  const e = o.length - 1, r = [];
  let i, s = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = F;
  for (let l = 0; l < e; l++) {
    const a = o[l];
    let d, h, c = -1, b = 0;
    for (; b < a.length && (n.lastIndex = b, h = n.exec(a), h !== null); ) b = n.lastIndex, n === F ? h[1] === "!--" ? n = Mt : h[1] !== void 0 ? n = Dt : h[2] !== void 0 ? (Jt.test(h[2]) && (i = RegExp("</" + h[2], "g")), n = U) : h[3] !== void 0 && (n = U) : n === U ? h[0] === ">" ? (n = i ?? F, c = -1) : h[1] === void 0 ? c = -2 : (c = n.lastIndex - h[2].length, d = h[1], n = h[3] === void 0 ? U : h[3] === '"' ? Bt : Ht) : n === Bt || n === Ht ? n = U : n === Mt || n === Dt ? n = F : (n = U, i = void 0);
    const v = n === U && o[l + 1].startsWith("/>") ? " " : "";
    s += n === F ? a + we : c >= 0 ? (r.push(d), a.slice(0, c) + Kt + a.slice(c) + O + v) : a + O + (c === -2 ? l : v);
  }
  return [Xt(o, s + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class Y {
  constructor({ strings: t, _$litType$: e }, r) {
    let i;
    this.parts = [];
    let s = 0, n = 0;
    const l = t.length - 1, a = this.parts, [d, h] = Ee(t, e);
    if (this.el = Y.createElement(d, r), N.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = N.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const c of i.getAttributeNames()) if (c.endsWith(Kt)) {
          const b = h[n++], v = i.getAttribute(c).split(O), m = /([.?@])?(.*)/.exec(b);
          a.push({ type: 1, index: s, name: m[2], strings: v, ctor: m[1] === "." ? Te : m[1] === "?" ? Pe : m[1] === "@" ? Le : nt }), i.removeAttribute(c);
        } else c.startsWith(O) && (a.push({ type: 6, index: s }), i.removeAttribute(c));
        if (Jt.test(i.tagName)) {
          const c = i.textContent.split(O), b = c.length - 1;
          if (b > 0) {
            i.textContent = ot ? ot.emptyScript : "";
            for (let v = 0; v < b; v++) i.append(c[v], q()), N.nextNode(), a.push({ type: 2, index: ++s });
            i.append(c[b], q());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Zt) a.push({ type: 2, index: s });
      else {
        let c = -1;
        for (; (c = i.data.indexOf(O, c + 1)) !== -1; ) a.push({ type: 7, index: s }), c += O.length - 1;
      }
      s++;
    }
  }
  static createElement(t, e) {
    const r = z.createElement("template");
    return r.innerHTML = t, r;
  }
}
function H(o, t, e = o, r) {
  if (t === k) return t;
  let i = r !== void 0 ? e._$Co?.[r] : e._$Cl;
  const s = W(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== s && (i?._$AO?.(!1), s === void 0 ? i = void 0 : (i = new s(o), i._$AT(o, e, r)), r !== void 0 ? (e._$Co ??= [])[r] = i : e._$Cl = i), i !== void 0 && (t = H(o, i._$AS(o, t.values), i, r)), t;
}
class Se {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: r } = this._$AD, i = (t?.creationScope ?? z).importNode(e, !0);
    N.currentNode = i;
    let s = N.nextNode(), n = 0, l = 0, a = r[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let d;
        a.type === 2 ? d = new Z(s, s.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(s, a.name, a.strings, this, t) : a.type === 6 && (d = new Oe(s, this, t)), this._$AV.push(d), a = r[++l];
      }
      n !== a?.index && (s = N.nextNode(), n++);
    }
    return N.currentNode = z, i;
  }
  p(t) {
    let e = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, e), e += r.strings.length - 2) : r._$AI(t[e])), e++;
  }
}
class Z {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, r, i) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = H(this, t, e), W(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== k && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ae(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && W(this._$AH) ? this._$AA.nextSibling.data = t : this.T(z.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: r } = t, i = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = Y.createElement(Xt(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const s = new Se(i, this), n = s.u(this.options);
      s.p(e), this.T(n), this._$AH = s;
    }
  }
  _$AC(t) {
    let e = Ft.get(t.strings);
    return e === void 0 && Ft.set(t.strings, e = new Y(t)), e;
  }
  k(t) {
    St(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let r, i = 0;
    for (const s of t) i === e.length ? e.push(r = new Z(this.O(q()), this.O(q()), this, this.options)) : r = e[i], r._$AI(s), i++;
    i < e.length && (this._$AR(r && r._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class nt {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, r, i, s) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = s, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = p;
  }
  _$AI(t, e = this, r, i) {
    const s = this.strings;
    let n = !1;
    if (s === void 0) t = H(this, t, e, 0), n = !W(t) || t !== this._$AH && t !== k, n && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = s[0], a = 0; a < s.length - 1; a++) d = H(this, l[r + a], e, a), d === k && (d = this._$AH[a]), n ||= !W(d) || d !== this._$AH[a], d === p ? t = p : t !== p && (t += (d ?? "") + s[a + 1]), this._$AH[a] = d;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Te extends nt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class Pe extends nt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Le extends nt {
  constructor(t, e, r, i, s) {
    super(t, e, r, i, s), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = H(this, t, e, 0) ?? p) === k) return;
    const r = this._$AH, i = t === p && r !== p || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, s = t !== p && (r === p || i);
    i && this.element.removeEventListener(this.name, this, r), s && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Oe {
  constructor(t, e, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    H(this, t);
  }
}
const ke = Et.litHtmlPolyfillSupport;
ke?.(Y, Z), (Et.litHtmlVersions ??= []).push("3.3.1");
const Ie = (o, t, e) => {
  const r = e?.renderBefore ?? t;
  let i = r._$litPart$;
  if (i === void 0) {
    const s = e?.renderBefore ?? null;
    r._$litPart$ = i = new Z(t.insertBefore(q(), s), s, void 0, e ?? {});
  }
  return i._$AI(o), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Tt = globalThis;
let C = class extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ie(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return k;
  }
};
C._$litElement$ = !0, C.finalized = !0, Tt.litElementHydrateSupport?.({ LitElement: C });
const Re = Tt.litElementPolyfillSupport;
Re?.({ LitElement: C });
(Tt.litElementVersions ??= []).push("4.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = (o) => (t, e) => {
  e !== void 0 ? e.addInitializer((() => {
    customElements.define(o, t);
  })) : customElements.define(o, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ue = { attribute: !0, type: String, converter: rt, reflect: !1, hasChanged: Ct }, Ne = (o = Ue, t, e) => {
  const { kind: r, metadata: i } = e;
  let s = globalThis.litPropertyMetadata.get(i);
  if (s === void 0 && globalThis.litPropertyMetadata.set(i, s = /* @__PURE__ */ new Map()), r === "setter" && ((o = Object.create(o)).wrapped = !0), s.set(e.name, o), r === "accessor") {
    const { name: n } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(n, a, o);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, o, l), l;
    } };
  }
  if (r === "setter") {
    const { name: n } = e;
    return function(l) {
      const a = this[n];
      t.call(this, l), this.requestUpdate(n, a, o);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function _(o) {
  return (t, e) => typeof e == "object" ? Ne(o, t, e) : ((r, i, s) => {
    const n = i.hasOwnProperty(s);
    return i.constructor.createProperty(s, r), n ? Object.getOwnPropertyDescriptor(i, s) : void 0;
  })(o, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function J(o) {
  return _({ ...o, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qt = (o, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(o, t, e), e);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function te(o, t) {
  return (e, r, i) => {
    const s = (n) => n.renderRoot?.querySelector(o) ?? null;
    return Qt(e, r, { get() {
      return s(this);
    } });
  };
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ze(o) {
  return (t, e) => {
    const { slot: r, selector: i } = o ?? {}, s = "slot" + (r ? `[name=${r}]` : ":not([name])");
    return Qt(t, e, { get() {
      const n = this.renderRoot?.querySelector(s), l = n?.assignedElements(o) ?? [];
      return i === void 0 ? l : l.filter(((a) => a.matches(i)));
    } });
  };
}
var lt = { exports: {} }, jt;
function Me() {
  return jt || (jt = 1, (function(o) {
    var t = Object.prototype.hasOwnProperty, e = "~";
    function r() {
    }
    Object.create && (r.prototype = /* @__PURE__ */ Object.create(null), new r().__proto__ || (e = !1));
    function i(a, d, h) {
      this.fn = a, this.context = d, this.once = h || !1;
    }
    function s(a, d, h, c, b) {
      if (typeof h != "function")
        throw new TypeError("The listener must be a function");
      var v = new i(h, c || a, b), m = e ? e + d : d;
      return a._events[m] ? a._events[m].fn ? a._events[m] = [a._events[m], v] : a._events[m].push(v) : (a._events[m] = v, a._eventsCount++), a;
    }
    function n(a, d) {
      --a._eventsCount === 0 ? a._events = new r() : delete a._events[d];
    }
    function l() {
      this._events = new r(), this._eventsCount = 0;
    }
    l.prototype.eventNames = function() {
      var d = [], h, c;
      if (this._eventsCount === 0) return d;
      for (c in h = this._events)
        t.call(h, c) && d.push(e ? c.slice(1) : c);
      return Object.getOwnPropertySymbols ? d.concat(Object.getOwnPropertySymbols(h)) : d;
    }, l.prototype.listeners = function(d) {
      var h = e ? e + d : d, c = this._events[h];
      if (!c) return [];
      if (c.fn) return [c.fn];
      for (var b = 0, v = c.length, m = new Array(v); b < v; b++)
        m[b] = c[b].fn;
      return m;
    }, l.prototype.listenerCount = function(d) {
      var h = e ? e + d : d, c = this._events[h];
      return c ? c.fn ? 1 : c.length : 0;
    }, l.prototype.emit = function(d, h, c, b, v, m) {
      var S = e ? e + d : d;
      if (!this._events[S]) return !1;
      var u = this._events[S], P = arguments.length, R, y;
      if (u.fn) {
        switch (u.once && this.removeListener(d, u.fn, void 0, !0), P) {
          case 1:
            return u.fn.call(u.context), !0;
          case 2:
            return u.fn.call(u.context, h), !0;
          case 3:
            return u.fn.call(u.context, h, c), !0;
          case 4:
            return u.fn.call(u.context, h, c, b), !0;
          case 5:
            return u.fn.call(u.context, h, c, b, v), !0;
          case 6:
            return u.fn.call(u.context, h, c, b, v, m), !0;
        }
        for (y = 1, R = new Array(P - 1); y < P; y++)
          R[y - 1] = arguments[y];
        u.fn.apply(u.context, R);
      } else {
        var ue = u.length, B;
        for (y = 0; y < ue; y++)
          switch (u[y].once && this.removeListener(d, u[y].fn, void 0, !0), P) {
            case 1:
              u[y].fn.call(u[y].context);
              break;
            case 2:
              u[y].fn.call(u[y].context, h);
              break;
            case 3:
              u[y].fn.call(u[y].context, h, c);
              break;
            case 4:
              u[y].fn.call(u[y].context, h, c, b);
              break;
            default:
              if (!R) for (B = 1, R = new Array(P - 1); B < P; B++)
                R[B - 1] = arguments[B];
              u[y].fn.apply(u[y].context, R);
          }
      }
      return !0;
    }, l.prototype.on = function(d, h, c) {
      return s(this, d, h, c, !1);
    }, l.prototype.once = function(d, h, c) {
      return s(this, d, h, c, !0);
    }, l.prototype.removeListener = function(d, h, c, b) {
      var v = e ? e + d : d;
      if (!this._events[v]) return this;
      if (!h)
        return n(this, v), this;
      var m = this._events[v];
      if (m.fn)
        m.fn === h && (!b || m.once) && (!c || m.context === c) && n(this, v);
      else {
        for (var S = 0, u = [], P = m.length; S < P; S++)
          (m[S].fn !== h || b && !m[S].once || c && m[S].context !== c) && u.push(m[S]);
        u.length ? this._events[v] = u.length === 1 ? u[0] : u : n(this, v);
      }
      return this;
    }, l.prototype.removeAllListeners = function(d) {
      var h;
      return d ? (h = e ? e + d : d, this._events[h] && n(this, h)) : (this._events = new r(), this._eventsCount = 0), this;
    }, l.prototype.off = l.prototype.removeListener, l.prototype.addListener = l.prototype.on, l.prefixed = e, l.EventEmitter = l, o.exports = l;
  })(lt)), lt.exports;
}
Me();
const L = {
  // Portal → Web Components
  AUTH_LOGOUT: "portal:auth:logout",
  LOCALE_CHANGE: "portal:locale:change",
  // Web Components → Portal
  NAVIGATE: "wc:navigate",
  ERROR: "wc:error",
  NOTIFICATION: "wc:notification",
  LOG: "wc:log"
};
function De() {
  if (!window.__AETHERWEAVE_EVENT_BUS__)
    throw new Error(
      "[EventBus] Portal EventBus not found. Ensure portal is loaded first."
    );
  return window.__AETHERWEAVE_EVENT_BUS__;
}
class He {
  constructor() {
    this.locale = "en", this.source = "user-management";
    try {
      this.emitter = De(), this.emitLog("Connected to portal EventBus", "debug");
    } catch (t) {
      throw console.error("[WC EventListener] Failed to connect:", t), t;
    }
  }
  // ============================================================================
  // LISTENERS (Portal → Web Component)
  // ============================================================================
  /**
   * Listen for logout from portal
   */
  onLogout(t) {
    const e = () => {
      this.emitLog("Logged out", "info"), t();
    };
    return this.emitter.on(L.AUTH_LOGOUT, e), () => this.emitter.off(L.AUTH_LOGOUT, e);
  }
  /**
   * Listen for locale changes from portal
   */
  onLocaleChange(t) {
    const e = (r) => {
      this.locale = r.locale, this.emitLog(`Locale changed: ${this.locale}`, "debug"), t(r);
    };
    return this.emitter.on(L.LOCALE_CHANGE, e), () => this.emitter.off(L.LOCALE_CHANGE, e);
  }
  // ============================================================================
  // GETTERS
  // ============================================================================
  /**
   * Get current locale
   */
  getLocale() {
    return this.locale;
  }
  // ============================================================================
  // EMITTERS (Web Component → Portal)
  // ============================================================================
  /**
   * Request navigation to a route
   */
  navigate(t, e = !1) {
    this.emitter.emit(L.NAVIGATE, { path: t, replace: e }), this.emitLog(`Navigation requested: ${t}`, "debug");
  }
  /**
   * Emit error to portal (will show error snackbar)
   */
  emitError(t, e, r = "user-management") {
    this.emitter.emit(L.ERROR, { message: t, code: e, source: r }), this.emitLog(`Error emitted: ${t}`, "error", { code: e });
  }
  /**
   * Emit notification to portal (will show snackbar)
   */
  emitNotification(t, e = "info") {
    this.emitter.emit(L.NOTIFICATION, { message: t, type: e }), this.emitLog(`Notification (${e}): ${t}`, "debug");
  }
  /**
   * Emit log message to portal (will appear in log panel)
   */
  emitLog(t, e, r) {
    this.emitter.emit(L.LOG, { message: t, level: e, source: this.source, meta: r });
  }
}
const g = new He();
class Be {
  constructor() {
    this.baseUrl = "/api/v1/users";
  }
  /**
   * Get authorization headers with JWT
   */
  getHeaders(t) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`
    };
  }
  /**
   * Handle API errors
   */
  async handleResponse(t) {
    if (!t.ok) {
      const e = await t.json().catch(() => ({ message: t.statusText }));
      throw new Error(e.message || `HTTP ${t.status}: ${t.statusText}`);
    }
    return t.json();
  }
  /**
   * Get all users
   */
  async getUsers(t) {
    try {
      const e = await fetch(this.baseUrl, {
        method: "GET",
        headers: this.getHeaders(t)
      });
      return this.handleResponse(e);
    } catch (e) {
      throw console.error("[UserAPI] Failed to fetch users:", e), g.emitError(e instanceof Error ? e.message : "Failed to fetch users"), e;
    }
  }
  /**
   * Get user by ID
   */
  async getUserById(t, e) {
    try {
      const r = await fetch(`${this.baseUrl}/${t}`, {
        method: "GET",
        headers: this.getHeaders(e)
      });
      return this.handleResponse(r);
    } catch (r) {
      throw console.error("[UserAPI] Failed to fetch user:", r), g.emitError(r instanceof Error ? r.message : "Failed to fetch user"), r;
    }
  }
  /**
   * Create new user
   */
  async createUser(t, e) {
    try {
      const r = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.getHeaders(e),
        body: JSON.stringify(t)
      }), i = await this.handleResponse(r);
      return g.emitNotification("User created successfully", "success"), i;
    } catch (r) {
      throw console.error("[UserAPI] Failed to create user:", r), g.emitError(r instanceof Error ? r.message : "Failed to create user"), r;
    }
  }
  /**
   * Update user
   */
  async updateUser(t, e, r) {
    try {
      const i = await fetch(`${this.baseUrl}/${t}`, {
        method: "PUT",
        headers: this.getHeaders(r),
        body: JSON.stringify(e)
      }), s = await this.handleResponse(i);
      return g.emitNotification("User updated successfully", "success"), s;
    } catch (i) {
      throw console.error("[UserAPI] Failed to update user:", i), g.emitError(i instanceof Error ? i.message : "Failed to update user"), i;
    }
  }
  /**
   * Delete user
   */
  async deleteUser(t, e) {
    try {
      const r = await fetch(`${this.baseUrl}/${t}`, {
        method: "DELETE",
        headers: this.getHeaders(e)
      });
      if (!r.ok) {
        const i = await r.json().catch(() => ({ message: r.statusText }));
        throw new Error(i.message || `HTTP ${r.status}: ${r.statusText}`);
      }
      g.emitNotification("User deleted successfully", "success");
    } catch (r) {
      throw console.error("[UserAPI] Failed to delete user:", r), g.emitError(r instanceof Error ? r.message : "Failed to delete user"), r;
    }
  }
}
const Vt = new Be(), ht = "langChanged";
function Fe(o, t, e) {
  return Object.entries(ut(t || {})).reduce((r, [i, s]) => r.replace(new RegExp(`{{[  ]*${i}[  ]*}}`, "gm"), String(ut(s))), o);
}
function je(o, t) {
  const e = o.split(".");
  let r = t.strings;
  for (; r != null && e.length > 0; )
    r = r[e.shift()];
  return r != null ? r.toString() : null;
}
function ut(o) {
  return typeof o == "function" ? o() : o;
}
const Ve = () => ({
  loader: () => Promise.resolve({}),
  empty: (o) => `[${o}]`,
  lookup: je,
  interpolate: Fe,
  translationCache: {}
});
let K = Ve();
function Ge(o) {
  return K = Object.assign(Object.assign({}, K), o);
}
function qe(o) {
  window.dispatchEvent(new CustomEvent(ht, { detail: o }));
}
function We(o, t, e = K) {
  qe({
    previousStrings: e.strings,
    previousLang: e.lang,
    lang: e.lang = o,
    strings: e.strings = t
  });
}
function Ye(o, t) {
  const e = (r) => o(r.detail);
  return window.addEventListener(ht, e, t), () => window.removeEventListener(ht, e);
}
async function V(o, t = K) {
  const e = await t.loader(o, t);
  t.translationCache = {}, We(o, e, t);
}
function ee(o, t, e = K) {
  let r = e.translationCache[o] || (e.translationCache[o] = e.lookup(o, e) || e.empty(o, e));
  return t = t != null ? ut(t) : null, t != null ? e.interpolate(r, t, e) : r;
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Pt = { ATTRIBUTE: 1, CHILD: 2 }, re = (o) => (...t) => ({ _$litDirective$: o, values: t });
class Lt {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, e, r) {
    this._$Ct = t, this._$AM = e, this._$Ci = r;
  }
  _$AS(t, e) {
    return this.update(t, e);
  }
  update(t, e) {
    return this.render(...e);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = (o) => o.strings === void 0;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = (o, t) => {
  const e = o._$AN;
  if (e === void 0) return !1;
  for (const r of e) r._$AO?.(t, !1), G(r, t);
  return !0;
}, it = (o) => {
  let t, e;
  do {
    if ((t = o._$AM) === void 0) break;
    e = t._$AN, e.delete(o), o = t;
  } while (e?.size === 0);
}, oe = (o) => {
  for (let t; t = o._$AM; o = t) {
    let e = t._$AN;
    if (e === void 0) t._$AN = e = /* @__PURE__ */ new Set();
    else if (e.has(o)) break;
    e.add(o), Xe(t);
  }
};
function Ze(o) {
  this._$AN !== void 0 ? (it(this), this._$AM = o, oe(this)) : this._$AM = o;
}
function Je(o, t = !1, e = 0) {
  const r = this._$AH, i = this._$AN;
  if (i !== void 0 && i.size !== 0) if (t) if (Array.isArray(r)) for (let s = e; s < r.length; s++) G(r[s], !1), it(r[s]);
  else r != null && (G(r, !1), it(r));
  else G(this, o);
}
const Xe = (o) => {
  o.type == Pt.CHILD && (o._$AP ??= Je, o._$AQ ??= Ze);
};
class Qe extends Lt {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(t, e, r) {
    super._$AT(t, e, r), oe(this), this.isConnected = t._$AU;
  }
  _$AO(t, e = !0) {
    t !== this.isConnected && (this.isConnected = t, t ? this.reconnected?.() : this.disconnected?.()), e && (G(this, t), it(this));
  }
  setValue(t) {
    if (Ke(this._$Ct)) this._$Ct._$AI(t, this);
    else {
      const e = [...this._$Ct._$AH];
      e[this._$Ci] = t, this._$Ct._$AI(e, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
}
class tr extends Qe {
  constructor() {
    super(...arguments), this.langChangedSubscription = null, this.getValue = (() => "");
  }
  /**
   * Sets up the directive by setting the getValue property and subscribing.
   * When subclassing LangChangedDirectiveBase this function should be call in the render function.
   * @param getValue
   */
  renderValue(t) {
    return this.getValue = t, this.subscribe(), this.getValue();
  }
  /**
   * Called when the lang changed event is dispatched.
   * @param e
   */
  langChanged(t) {
    this.setValue(this.getValue(t));
  }
  /**
   * Subscribes to the lang changed event.
   */
  subscribe() {
    this.langChangedSubscription == null && (this.langChangedSubscription = Ye(this.langChanged.bind(this)));
  }
  /**
   * Unsubscribes from the lang changed event.
   */
  unsubscribe() {
    this.langChangedSubscription != null && this.langChangedSubscription();
  }
  /**
   * Unsubscribes when disconnected.
   */
  disconnected() {
    this.unsubscribe();
  }
  /**
   * Subscribes when reconnected.
   */
  reconnected() {
    this.subscribe();
  }
}
class er extends tr {
  render(t, e, r) {
    return this.renderValue(() => ee(t, e, r));
  }
}
const x = re(er);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let Gt = class extends Lt {
  constructor(t) {
    if (super(t), this.it = p, t.type !== Pt.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === p || t == null) return this._t = void 0, this.it = t;
    if (t === k) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const e = [t];
    return e.raw = e, this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] };
  }
};
Gt.directiveName = "unsafeHTML", Gt.resultType = 1;
Ge({
  loader: async (o) => {
    switch (o) {
      case "en":
        return (await import("./en-9KfDqlwb.js")).default;
      case "fr":
        return (await import("./fr-ClhW3aC4.js")).default;
      default:
        return (await import("./en-9KfDqlwb.js")).default;
    }
  }
});
V("en");
const rr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get: ee,
  translate: x,
  use: V
}, Symbol.toStringTag, { value: "Module" }));
function f(o, t, e, r) {
  var i = arguments.length, s = i < 3 ? t : r === null ? r = Object.getOwnPropertyDescriptor(t, e) : r, n;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") s = Reflect.decorate(o, t, e, r);
  else for (var l = o.length - 1; l >= 0; l--) (n = o[l]) && (s = (i < 3 ? n(s) : i > 3 ? n(t, e, s) : n(t, e)) || s);
  return i > 3 && s && Object.defineProperty(t, e, s), s;
}
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class or extends C {
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  render() {
    return $`<span class="shadow"></span>`;
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const ir = E`:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let pt = class extends or {
};
pt.styles = [ir];
pt = f([
  I("md-elevation")
], pt);
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const ie = Symbol("attachableController");
let se;
se = new MutationObserver((o) => {
  for (const t of o)
    t.target[ie]?.hostConnected();
});
class ne {
  get htmlFor() {
    return this.host.getAttribute("for");
  }
  set htmlFor(t) {
    t === null ? this.host.removeAttribute("for") : this.host.setAttribute("for", t);
  }
  get control() {
    return this.host.hasAttribute("for") ? !this.htmlFor || !this.host.isConnected ? null : this.host.getRootNode().querySelector(`#${this.htmlFor}`) : this.currentControl || this.host.parentElement;
  }
  set control(t) {
    t ? this.attach(t) : this.detach();
  }
  /**
   * Creates a new controller for an `Attachable` element.
   *
   * @param host The `Attachable` element.
   * @param onControlChange A callback with two parameters for the previous and
   *     next control. An `Attachable` element may perform setup or teardown
   *     logic whenever the control changes.
   */
  constructor(t, e) {
    this.host = t, this.onControlChange = e, this.currentControl = null, t.addController(this), t[ie] = this, se?.observe(t, { attributeFilter: ["for"] });
  }
  attach(t) {
    t !== this.currentControl && (this.setCurrentControl(t), this.host.removeAttribute("for"));
  }
  detach() {
    this.setCurrentControl(null), this.host.setAttribute("for", "");
  }
  /** @private */
  hostConnected() {
    this.setCurrentControl(this.control);
  }
  /** @private */
  hostDisconnected() {
    this.setCurrentControl(null);
  }
  setCurrentControl(t) {
    this.onControlChange(this.currentControl, t), this.currentControl = t;
  }
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const sr = ["focusin", "focusout", "pointerdown"];
class Ot extends C {
  constructor() {
    super(...arguments), this.visible = !1, this.inward = !1, this.attachableController = new ne(this, this.onControlChange.bind(this));
  }
  get htmlFor() {
    return this.attachableController.htmlFor;
  }
  set htmlFor(t) {
    this.attachableController.htmlFor = t;
  }
  get control() {
    return this.attachableController.control;
  }
  set control(t) {
    this.attachableController.control = t;
  }
  attach(t) {
    this.attachableController.attach(t);
  }
  detach() {
    this.attachableController.detach();
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  /** @private */
  handleEvent(t) {
    if (!t[qt]) {
      switch (t.type) {
        default:
          return;
        case "focusin":
          this.visible = this.control?.matches(":focus-visible") ?? !1;
          break;
        case "focusout":
        case "pointerdown":
          this.visible = !1;
          break;
      }
      t[qt] = !0;
    }
  }
  onControlChange(t, e) {
    for (const r of sr)
      t?.removeEventListener(r, this), e?.addEventListener(r, this);
  }
  update(t) {
    t.has("visible") && this.dispatchEvent(new Event("visibility-changed")), super.update(t);
  }
}
f([
  _({ type: Boolean, reflect: !0 })
], Ot.prototype, "visible", void 0);
f([
  _({ type: Boolean, reflect: !0 })
], Ot.prototype, "inward", void 0);
const qt = Symbol("handledByFocusRing");
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const nr = E`:host{animation-delay:0s,calc(var(--md-focus-ring-duration, 600ms)*.25);animation-duration:calc(var(--md-focus-ring-duration, 600ms)*.25),calc(var(--md-focus-ring-duration, 600ms)*.75);animation-timing-function:cubic-bezier(0.2, 0, 0, 1);box-sizing:border-box;color:var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));display:none;pointer-events:none;position:absolute}:host([visible]){display:flex}:host(:not([inward])){animation-name:outward-grow,outward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));inset:calc(-1*var(--md-focus-ring-outward-offset, 2px));outline:var(--md-focus-ring-width, 3px) solid currentColor}:host([inward]){animation-name:inward-grow,inward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border:var(--md-focus-ring-width, 3px) solid currentColor;inset:var(--md-focus-ring-inward-offset, 0px)}@keyframes outward-grow{from{outline-width:0}to{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes outward-shrink{from{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-grow{from{border-width:0}to{border-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-shrink{from{border-width:var(--md-focus-ring-active-width, 8px)}}@media(prefers-reduced-motion){:host{animation:none}}
`;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let ft = class extends Ot {
};
ft.styles = [nr];
ft = f([
  I("md-focus-ring")
], ft);
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = re(class extends Lt {
  constructor(o) {
    if (super(o), o.type !== Pt.ATTRIBUTE || o.name !== "class" || o.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(o) {
    return " " + Object.keys(o).filter(((t) => o[t])).join(" ") + " ";
  }
  update(o, [t]) {
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), o.strings !== void 0 && (this.nt = new Set(o.strings.join(" ").split(/\s/).filter(((r) => r !== ""))));
      for (const r in t) t[r] && !this.nt?.has(r) && this.st.add(r);
      return this.render(t);
    }
    const e = o.element.classList;
    for (const r of this.st) r in t || (e.remove(r), this.st.delete(r));
    for (const r in t) {
      const i = !!t[r];
      i === this.st.has(r) || this.nt?.has(r) || (i ? (e.add(r), this.st.add(r)) : (e.remove(r), this.st.delete(r)));
    }
    return k;
  }
});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const ar = {
  STANDARD: "cubic-bezier(0.2, 0, 0, 1)"
};
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const lr = 450, Wt = 225, cr = 0.2, dr = 10, hr = 75, ur = 0.35, pr = "::after", fr = "forwards";
var A;
(function(o) {
  o[o.INACTIVE = 0] = "INACTIVE", o[o.TOUCH_DELAY = 1] = "TOUCH_DELAY", o[o.HOLDING = 2] = "HOLDING", o[o.WAITING_FOR_CLICK = 3] = "WAITING_FOR_CLICK";
})(A || (A = {}));
const mr = [
  "click",
  "contextmenu",
  "pointercancel",
  "pointerdown",
  "pointerenter",
  "pointerleave",
  "pointerup"
], vr = 150, br = window.matchMedia("(forced-colors: active)");
class X extends C {
  constructor() {
    super(...arguments), this.disabled = !1, this.hovered = !1, this.pressed = !1, this.rippleSize = "", this.rippleScale = "", this.initialSize = 0, this.state = A.INACTIVE, this.attachableController = new ne(this, this.onControlChange.bind(this));
  }
  get htmlFor() {
    return this.attachableController.htmlFor;
  }
  set htmlFor(t) {
    this.attachableController.htmlFor = t;
  }
  get control() {
    return this.attachableController.control;
  }
  set control(t) {
    this.attachableController.control = t;
  }
  attach(t) {
    this.attachableController.attach(t);
  }
  detach() {
    this.attachableController.detach();
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("aria-hidden", "true");
  }
  render() {
    const t = {
      hovered: this.hovered,
      pressed: this.pressed
    };
    return $`<div class="surface ${ae(t)}"></div>`;
  }
  update(t) {
    t.has("disabled") && this.disabled && (this.hovered = !1, this.pressed = !1), super.update(t);
  }
  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerenter(t) {
    this.shouldReactToEvent(t) && (this.hovered = !0);
  }
  /**
   * TODO(b/269799771): make private
   * @private only public for slider
   */
  handlePointerleave(t) {
    this.shouldReactToEvent(t) && (this.hovered = !1, this.state !== A.INACTIVE && this.endPressAnimation());
  }
  handlePointerup(t) {
    if (this.shouldReactToEvent(t)) {
      if (this.state === A.HOLDING) {
        this.state = A.WAITING_FOR_CLICK;
        return;
      }
      if (this.state === A.TOUCH_DELAY) {
        this.state = A.WAITING_FOR_CLICK, this.startPressAnimation(this.rippleStartEvent);
        return;
      }
    }
  }
  async handlePointerdown(t) {
    if (this.shouldReactToEvent(t)) {
      if (this.rippleStartEvent = t, !this.isTouch(t)) {
        this.state = A.WAITING_FOR_CLICK, this.startPressAnimation(t);
        return;
      }
      this.state = A.TOUCH_DELAY, await new Promise((e) => {
        setTimeout(e, vr);
      }), this.state === A.TOUCH_DELAY && (this.state = A.HOLDING, this.startPressAnimation(t));
    }
  }
  handleClick() {
    if (!this.disabled) {
      if (this.state === A.WAITING_FOR_CLICK) {
        this.endPressAnimation();
        return;
      }
      this.state === A.INACTIVE && (this.startPressAnimation(), this.endPressAnimation());
    }
  }
  handlePointercancel(t) {
    this.shouldReactToEvent(t) && this.endPressAnimation();
  }
  handleContextmenu() {
    this.disabled || this.endPressAnimation();
  }
  determineRippleSize() {
    const { height: t, width: e } = this.getBoundingClientRect(), r = Math.max(t, e), i = Math.max(ur * r, hr), s = this.currentCSSZoom ?? 1, n = Math.floor(r * cr / s), a = Math.sqrt(e ** 2 + t ** 2) + dr;
    this.initialSize = n;
    const d = (a + i) / n;
    this.rippleScale = `${d / s}`, this.rippleSize = `${n}px`;
  }
  getNormalizedPointerEventCoords(t) {
    const { scrollX: e, scrollY: r } = window, { left: i, top: s } = this.getBoundingClientRect(), n = e + i, l = r + s, { pageX: a, pageY: d } = t, h = this.currentCSSZoom ?? 1;
    return {
      x: (a - n) / h,
      y: (d - l) / h
    };
  }
  getTranslationCoordinates(t) {
    const { height: e, width: r } = this.getBoundingClientRect(), i = this.currentCSSZoom ?? 1, s = {
      x: (r / i - this.initialSize) / 2,
      y: (e / i - this.initialSize) / 2
    };
    let n;
    return t instanceof PointerEvent ? n = this.getNormalizedPointerEventCoords(t) : n = {
      x: r / i / 2,
      y: e / i / 2
    }, n = {
      x: n.x - this.initialSize / 2,
      y: n.y - this.initialSize / 2
    }, { startPoint: n, endPoint: s };
  }
  startPressAnimation(t) {
    if (!this.mdRoot)
      return;
    this.pressed = !0, this.growAnimation?.cancel(), this.determineRippleSize();
    const { startPoint: e, endPoint: r } = this.getTranslationCoordinates(t), i = `${e.x}px, ${e.y}px`, s = `${r.x}px, ${r.y}px`;
    this.growAnimation = this.mdRoot.animate({
      top: [0, 0],
      left: [0, 0],
      height: [this.rippleSize, this.rippleSize],
      width: [this.rippleSize, this.rippleSize],
      transform: [
        `translate(${i}) scale(1)`,
        `translate(${s}) scale(${this.rippleScale})`
      ]
    }, {
      pseudoElement: pr,
      duration: lr,
      easing: ar.STANDARD,
      fill: fr
    });
  }
  async endPressAnimation() {
    this.rippleStartEvent = void 0, this.state = A.INACTIVE;
    const t = this.growAnimation;
    let e = 1 / 0;
    if (typeof t?.currentTime == "number" ? e = t.currentTime : t?.currentTime && (e = t.currentTime.to("ms").value), e >= Wt) {
      this.pressed = !1;
      return;
    }
    await new Promise((r) => {
      setTimeout(r, Wt - e);
    }), this.growAnimation === t && (this.pressed = !1);
  }
  /**
   * Returns `true` if
   *  - the ripple element is enabled
   *  - the pointer is primary for the input type
   *  - the pointer is the pointer that started the interaction, or will start
   * the interaction
   *  - the pointer is a touch, or the pointer state has the primary button
   * held, or the pointer is hovering
   */
  shouldReactToEvent(t) {
    if (this.disabled || !t.isPrimary || this.rippleStartEvent && this.rippleStartEvent.pointerId !== t.pointerId)
      return !1;
    if (t.type === "pointerenter" || t.type === "pointerleave")
      return !this.isTouch(t);
    const e = t.buttons === 1;
    return this.isTouch(t) || e;
  }
  isTouch({ pointerType: t }) {
    return t === "touch";
  }
  /** @private */
  async handleEvent(t) {
    if (!br?.matches)
      switch (t.type) {
        case "click":
          this.handleClick();
          break;
        case "contextmenu":
          this.handleContextmenu();
          break;
        case "pointercancel":
          this.handlePointercancel(t);
          break;
        case "pointerdown":
          await this.handlePointerdown(t);
          break;
        case "pointerenter":
          this.handlePointerenter(t);
          break;
        case "pointerleave":
          this.handlePointerleave(t);
          break;
        case "pointerup":
          this.handlePointerup(t);
          break;
      }
  }
  onControlChange(t, e) {
    for (const r of mr)
      t?.removeEventListener(r, this), e?.addEventListener(r, this);
  }
}
f([
  _({ type: Boolean, reflect: !0 })
], X.prototype, "disabled", void 0);
f([
  J()
], X.prototype, "hovered", void 0);
f([
  J()
], X.prototype, "pressed", void 0);
f([
  te(".surface")
], X.prototype, "mdRoot", void 0);
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const gr = E`:host{display:flex;margin:auto;pointer-events:none}:host([disabled]){display:none}@media(forced-colors: active){:host{display:none}}:host,.surface{border-radius:inherit;position:absolute;inset:0;overflow:hidden}.surface{-webkit-tap-highlight-color:rgba(0,0,0,0)}.surface::before,.surface::after{content:"";opacity:0;position:absolute}.surface::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));inset:0;transition:opacity 15ms linear,background-color 15ms linear}.surface::after{background:radial-gradient(closest-side, var(--md-ripple-pressed-color, var(--md-sys-color-on-surface, #1d1b20)) max(100% - 70px, 65%), transparent 100%);transform-origin:center center;transition:opacity 375ms linear}.hovered::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-ripple-hover-opacity, 0.08)}.pressed::after{opacity:var(--md-ripple-pressed-opacity, 0.12);transition-duration:105ms}
`;
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let mt = class extends X {
};
mt.styles = [gr];
mt = f([
  I("md-ripple")
], mt);
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const le = [
  "role",
  "ariaAtomic",
  "ariaAutoComplete",
  "ariaBusy",
  "ariaChecked",
  "ariaColCount",
  "ariaColIndex",
  "ariaColSpan",
  "ariaCurrent",
  "ariaDisabled",
  "ariaExpanded",
  "ariaHasPopup",
  "ariaHidden",
  "ariaInvalid",
  "ariaKeyShortcuts",
  "ariaLabel",
  "ariaLevel",
  "ariaLive",
  "ariaModal",
  "ariaMultiLine",
  "ariaMultiSelectable",
  "ariaOrientation",
  "ariaPlaceholder",
  "ariaPosInSet",
  "ariaPressed",
  "ariaReadOnly",
  "ariaRequired",
  "ariaRoleDescription",
  "ariaRowCount",
  "ariaRowIndex",
  "ariaRowSpan",
  "ariaSelected",
  "ariaSetSize",
  "ariaSort",
  "ariaValueMax",
  "ariaValueMin",
  "ariaValueNow",
  "ariaValueText"
], yr = le.map(ce);
function ct(o) {
  return yr.includes(o);
}
function ce(o) {
  return o.replace("aria", "aria-").replace(/Elements?/g, "").toLowerCase();
}
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const tt = Symbol("privateIgnoreAttributeChangesFor");
function de(o) {
  var t;
  class e extends o {
    constructor() {
      super(...arguments), this[t] = /* @__PURE__ */ new Set();
    }
    attributeChangedCallback(i, s, n) {
      if (!ct(i)) {
        super.attributeChangedCallback(i, s, n);
        return;
      }
      if (this[tt].has(i))
        return;
      this[tt].add(i), this.removeAttribute(i), this[tt].delete(i);
      const l = bt(i);
      n === null ? delete this.dataset[l] : this.dataset[l] = n, this.requestUpdate(bt(i), s);
    }
    getAttribute(i) {
      return ct(i) ? super.getAttribute(vt(i)) : super.getAttribute(i);
    }
    removeAttribute(i) {
      super.removeAttribute(i), ct(i) && (super.removeAttribute(vt(i)), this.requestUpdate());
    }
  }
  return t = tt, _r(e), e;
}
function _r(o) {
  for (const t of le) {
    const e = ce(t), r = vt(e), i = bt(e);
    o.createProperty(t, {
      attribute: e,
      noAccessor: !0
    }), o.createProperty(Symbol(r), {
      attribute: r,
      noAccessor: !0
    }), Object.defineProperty(o.prototype, t, {
      configurable: !0,
      enumerable: !0,
      get() {
        return this.dataset[i] ?? null;
      },
      set(s) {
        const n = this.dataset[i] ?? null;
        s !== n && (s === null ? delete this.dataset[i] : this.dataset[i] = s, this.requestUpdate(t, n));
      }
    });
  }
}
function vt(o) {
  return `data-${o}`;
}
function bt(o) {
  return o.replace(/-\w/, (t) => t[1].toUpperCase());
}
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const kt = Symbol("internals"), dt = Symbol("privateInternals");
function $r(o) {
  class t extends o {
    get [kt]() {
      return this[dt] || (this[dt] = this.attachInternals()), this[dt];
    }
  }
  return t;
}
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function xr(o) {
  o.addInitializer((t) => {
    const e = t;
    e.addEventListener("click", async (r) => {
      const { type: i, [kt]: s } = e, { form: n } = s;
      if (!(!n || i === "button") && (await new Promise((l) => {
        setTimeout(l);
      }), !r.defaultPrevented)) {
        if (i === "reset") {
          n.reset();
          return;
        }
        n.addEventListener("submit", (l) => {
          Object.defineProperty(l, "submitter", {
            configurable: !0,
            enumerable: !0,
            get: () => e
          });
        }, { capture: !0, once: !0 }), s.setFormValue(e.value), n.requestSubmit();
      }
    });
  });
}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
function wr(o) {
  const t = new MouseEvent("click", { bubbles: !0 });
  return o.dispatchEvent(t), t;
}
function Ar(o) {
  return o.currentTarget !== o.target || o.composedPath()[0] !== o.target || o.target.disabled ? !1 : !Cr(o);
}
function Cr(o) {
  const t = gt;
  return t && (o.preventDefault(), o.stopImmediatePropagation()), Er(), t;
}
let gt = !1;
async function Er() {
  gt = !0, await null, gt = !1;
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Sr = de($r(C));
class w extends Sr {
  get name() {
    return this.getAttribute("name") ?? "";
  }
  set name(t) {
    this.setAttribute("name", t);
  }
  /**
   * The associated form element with which this element's value will submit.
   */
  get form() {
    return this[kt].form;
  }
  constructor() {
    super(), this.disabled = !1, this.softDisabled = !1, this.href = "", this.download = "", this.target = "", this.trailingIcon = !1, this.hasIcon = !1, this.type = "submit", this.value = "", this.addEventListener("click", this.handleClick.bind(this));
  }
  focus() {
    this.buttonElement?.focus();
  }
  blur() {
    this.buttonElement?.blur();
  }
  render() {
    const t = this.disabled || this.softDisabled, e = this.href ? this.renderLink() : this.renderButton(), r = this.href ? "link" : "button";
    return $`
      ${this.renderElevationOrOutline?.()}
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${r}></md-focus-ring>
      <md-ripple
        part="ripple"
        for=${r}
        ?disabled="${t}"></md-ripple>
      ${e}
    `;
  }
  renderButton() {
    const { ariaLabel: t, ariaHasPopup: e, ariaExpanded: r } = this;
    return $`<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-disabled=${this.softDisabled || p}
      aria-label="${t || p}"
      aria-haspopup="${e || p}"
      aria-expanded="${r || p}">
      ${this.renderContent()}
    </button>`;
  }
  renderLink() {
    const { ariaLabel: t, ariaHasPopup: e, ariaExpanded: r } = this;
    return $`<a
      id="link"
      class="button"
      aria-label="${t || p}"
      aria-haspopup="${e || p}"
      aria-expanded="${r || p}"
      aria-disabled=${this.disabled || this.softDisabled || p}
      tabindex="${this.disabled && !this.softDisabled ? -1 : p}"
      href=${this.href}
      download=${this.download || p}
      target=${this.target || p}
      >${this.renderContent()}
    </a>`;
  }
  renderContent() {
    const t = $`<slot
      name="icon"
      @slotchange="${this.handleSlotChange}"></slot>`;
    return $`
      <span class="touch"></span>
      ${this.trailingIcon ? p : t}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon ? t : p}
    `;
  }
  handleClick(t) {
    if (this.softDisabled || this.disabled && this.href) {
      t.stopImmediatePropagation(), t.preventDefault();
      return;
    }
    !Ar(t) || !this.buttonElement || (this.focus(), wr(this.buttonElement));
  }
  handleSlotChange() {
    this.hasIcon = this.assignedIcons.length > 0;
  }
}
xr(w);
w.formAssociated = !0;
w.shadowRootOptions = {
  mode: "open",
  delegatesFocus: !0
};
f([
  _({ type: Boolean, reflect: !0 })
], w.prototype, "disabled", void 0);
f([
  _({ type: Boolean, attribute: "soft-disabled", reflect: !0 })
], w.prototype, "softDisabled", void 0);
f([
  _()
], w.prototype, "href", void 0);
f([
  _()
], w.prototype, "download", void 0);
f([
  _()
], w.prototype, "target", void 0);
f([
  _({ type: Boolean, attribute: "trailing-icon", reflect: !0 })
], w.prototype, "trailingIcon", void 0);
f([
  _({ type: Boolean, attribute: "has-icon", reflect: !0 })
], w.prototype, "hasIcon", void 0);
f([
  _()
], w.prototype, "type", void 0);
f([
  _({ reflect: !0 })
], w.prototype, "value", void 0);
f([
  te(".button")
], w.prototype, "buttonElement", void 0);
f([
  ze({ slot: "icon", flatten: !0 })
], w.prototype, "assignedIcons", void 0);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Tr extends w {
  renderElevationOrOutline() {
    return $`<md-elevation part="elevation"></md-elevation>`;
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Pr = E`:host{--_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));--_container-elevation: var(--md-filled-button-container-elevation, 0);--_container-height: var(--md-filled-button-container-height, 40px);--_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));--_disabled-container-color: var(--md-filled-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);--_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);--_disabled-label-text-color: var(--md-filled-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);--_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);--_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);--_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-color: var(--md-filled-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));--_label-text-font: var(--md-filled-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filled-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);--_pressed-label-text-color: var(--md-filled-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-color: var(--md-filled-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));--_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-size: var(--md-filled-button-icon-size, 18px);--_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));--_container-shape-start-start: var(--md-filled-button-container-shape-start-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-filled-button-container-shape-start-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-filled-button-container-shape-end-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-filled-button-container-shape-end-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-filled-button-leading-space, 24px);--_trailing-space: var(--md-filled-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px)}
`;
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Lr = E`md-elevation{transition-duration:280ms}:host(:is([disabled],[soft-disabled])) md-elevation{transition:none}md-elevation{--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}:host(:focus-within) md-elevation{--md-elevation-level: var(--_focus-container-elevation)}:host(:hover) md-elevation{--md-elevation-level: var(--_hover-container-elevation)}:host(:active) md-elevation{--md-elevation-level: var(--_pressed-container-elevation)}:host(:is([disabled],[soft-disabled])) md-elevation{--md-elevation-level: var(--_disabled-container-elevation)}
`;
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const he = E`:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);box-sizing:border-box;cursor:pointer;display:inline-flex;gap:8px;min-height:var(--_container-height);outline:none;padding-block:calc((var(--_container-height) - max(var(--_label-text-line-height),var(--_icon-size)))/2);padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space);place-content:center;place-items:center;position:relative;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);text-overflow:ellipsis;text-wrap:nowrap;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:top;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host(:is([disabled],[soft-disabled])){cursor:default;pointer-events:none}.button{border-radius:inherit;cursor:inherit;display:inline-flex;align-items:center;justify-content:center;border:none;outline:none;-webkit-appearance:none;vertical-align:middle;background:rgba(0,0,0,0);text-decoration:none;min-width:calc(64px - var(--_leading-space) - var(--_trailing-space));width:100%;z-index:0;height:100%;font:inherit;color:var(--_label-text-color);padding:0;gap:inherit;text-transform:inherit}.button::-moz-focus-inner{padding:0;border:0}:host(:hover) .button{color:var(--_hover-label-text-color)}:host(:focus-within) .button{color:var(--_focus-label-text-color)}:host(:active) .button{color:var(--_pressed-label-text-color)}.background{background:var(--_container-color);border-radius:inherit;inset:0;position:absolute}.label{overflow:hidden}:is(.button,.label,.label slot),.label ::slotted(*){text-overflow:inherit}:host(:is([disabled],[soft-disabled])) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}:host(:is([disabled],[soft-disabled])) .background{background:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}@media(forced-colors: active){.background{border:1px solid CanvasText}:host(:is([disabled],[soft-disabled])){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1;--_disabled-container-opacity: 1;--_disabled-label-text-color: GrayText;--_disabled-label-text-opacity: 1}}:host([has-icon]:not([trailing-icon])){padding-inline-start:var(--_with-leading-icon-leading-space);padding-inline-end:var(--_with-leading-icon-trailing-space)}:host([has-icon][trailing-icon]){padding-inline-start:var(--_with-trailing-icon-leading-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;flex-shrink:0;color:var(--_icon-color);font-size:var(--_icon-size);inline-size:var(--_icon-size);block-size:var(--_icon-size)}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus-within) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host(:is([disabled],[soft-disabled])) ::slotted([slot=icon]){color:var(--_disabled-icon-color);opacity:var(--_disabled-icon-opacity)}.touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}:host([touch-target=none]) .touch{display:none}
`;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let yt = class extends Tr {
};
yt.styles = [
  he,
  Lr,
  Pr
];
yt = f([
  I("md-filled-button")
], yt);
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Or extends w {
}
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const kr = E`:host{--_container-height: var(--md-text-button-container-height, 40px);--_disabled-label-text-color: var(--md-text-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-text-button-disabled-label-text-opacity, 0.38);--_focus-label-text-color: var(--md-text-button-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-label-text-color: var(--md-text-button-hover-label-text-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-color: var(--md-text-button-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_hover-state-layer-opacity: var(--md-text-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-text-button-label-text-color, var(--md-sys-color-primary, #6750a4));--_label-text-font: var(--md-text-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-text-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-text-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-text-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-label-text-color: var(--md-text-button-pressed-label-text-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-color: var(--md-text-button-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_pressed-state-layer-opacity: var(--md-text-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-text-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-text-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-text-button-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_hover-icon-color: var(--md-text-button-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-color: var(--md-text-button-icon-color, var(--md-sys-color-primary, #6750a4));--_icon-size: var(--md-text-button-icon-size, 18px);--_pressed-icon-color: var(--md-text-button-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_container-shape-start-start: var(--md-text-button-container-shape-start-start, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-text-button-container-shape-start-end, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-text-button-container-shape-end-end, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-text-button-container-shape-end-start, var(--md-text-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-text-button-leading-space, 12px);--_trailing-space: var(--md-text-button-trailing-space, 12px);--_with-leading-icon-leading-space: var(--md-text-button-with-leading-icon-leading-space, 12px);--_with-leading-icon-trailing-space: var(--md-text-button-with-leading-icon-trailing-space, 16px);--_with-trailing-icon-leading-space: var(--md-text-button-with-trailing-icon-leading-space, 16px);--_with-trailing-icon-trailing-space: var(--md-text-button-with-trailing-icon-trailing-space, 12px);--_container-color: none;--_disabled-container-color: none;--_disabled-container-opacity: 0}
`;
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let _t = class extends Or {
};
_t.styles = [he, kr];
_t = f([
  I("md-text-button")
], _t);
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Ir extends C {
  render() {
    return $`<slot></slot>`;
  }
  connectedCallback() {
    if (super.connectedCallback(), this.getAttribute("aria-hidden") === "false") {
      this.removeAttribute("aria-hidden");
      return;
    }
    this.setAttribute("aria-hidden", "true");
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Rr = E`:host{font-size:var(--md-icon-size, 24px);width:var(--md-icon-size, 24px);height:var(--md-icon-size, 24px);color:inherit;font-variation-settings:inherit;font-weight:400;font-family:var(--md-icon-font, Material Symbols Outlined);display:inline-flex;font-style:normal;place-items:center;place-content:center;line-height:1;overflow:hidden;letter-spacing:normal;text-transform:none;user-select:none;white-space:nowrap;word-wrap:normal;flex-shrink:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale}::slotted(svg){fill:currentColor}::slotted(*){height:100%;width:100%}
`;
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let $t = class extends Ir {
};
$t.styles = [Rr];
$t = f([
  I("md-icon")
], $t);
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const Ur = de(C);
class Q extends Ur {
  constructor() {
    super(...arguments), this.value = 0, this.max = 1, this.indeterminate = !1, this.fourColor = !1;
  }
  render() {
    const { ariaLabel: t } = this;
    return $`
      <div
        class="progress ${ae(this.getRenderClasses())}"
        role="progressbar"
        aria-label="${t || p}"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate ? p : this.value}
        >${this.renderIndicator()}</div
      >
    `;
  }
  getRenderClasses() {
    return {
      indeterminate: this.indeterminate,
      "four-color": this.fourColor
    };
  }
}
f([
  _({ type: Number })
], Q.prototype, "value", void 0);
f([
  _({ type: Number })
], Q.prototype, "max", void 0);
f([
  _({ type: Boolean })
], Q.prototype, "indeterminate", void 0);
f([
  _({ type: Boolean, attribute: "four-color" })
], Q.prototype, "fourColor", void 0);
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
class Nr extends Q {
  renderIndicator() {
    return this.indeterminate ? this.renderIndeterminateContainer() : this.renderDeterminateContainer();
  }
  // Determinate mode is rendered with an svg so the progress arc can be
  // easily animated via stroke-dashoffset.
  renderDeterminateContainer() {
    const t = (1 - this.value / this.max) * 100;
    return $`
      <svg viewBox="0 0 4800 4800">
        <circle class="track" pathLength="100"></circle>
        <circle
          class="active-track"
          pathLength="100"
          stroke-dashoffset=${t}></circle>
      </svg>
    `;
  }
  // Indeterminate mode rendered with 2 bordered-divs. The borders are
  // clipped into half circles by their containers. The divs are then carefully
  // animated to produce changes to the spinner arc size.
  // This approach has 4.5x the FPS of rendering via svg on Chrome 111.
  // See https://lit.dev/playground/#gist=febb773565272f75408ab06a0eb49746.
  renderIndeterminateContainer() {
    return $` <div class="spinner">
      <div class="left">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="circle"></div>
      </div>
    </div>`;
  }
}
/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const zr = E`:host{--_active-indicator-color: var(--md-circular-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-width: var(--md-circular-progress-active-indicator-width, 10);--_four-color-active-indicator-four-color: var(--md-circular-progress-four-color-active-indicator-four-color, var(--md-sys-color-tertiary-container, #ffd8e4));--_four-color-active-indicator-one-color: var(--md-circular-progress-four-color-active-indicator-one-color, var(--md-sys-color-primary, #6750a4));--_four-color-active-indicator-three-color: var(--md-circular-progress-four-color-active-indicator-three-color, var(--md-sys-color-tertiary, #7d5260));--_four-color-active-indicator-two-color: var(--md-circular-progress-four-color-active-indicator-two-color, var(--md-sys-color-primary-container, #eaddff));--_size: var(--md-circular-progress-size, 48px);display:inline-flex;vertical-align:middle;width:var(--_size);height:var(--_size);position:relative;align-items:center;justify-content:center;contain:strict;content-visibility:auto}.progress{flex:1;align-self:stretch;margin:4px}.progress,.spinner,.left,.right,.circle,svg,.track,.active-track{position:absolute;inset:0}svg{transform:rotate(-90deg)}circle{cx:50%;cy:50%;r:calc(50%*(1 - var(--_active-indicator-width)/100));stroke-width:calc(var(--_active-indicator-width)*1%);stroke-dasharray:100;fill:rgba(0,0,0,0)}.active-track{transition:stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);stroke:var(--_active-indicator-color)}.track{stroke:rgba(0,0,0,0)}.progress.indeterminate{animation:linear infinite linear-rotate;animation-duration:1568.2352941176ms}.spinner{animation:infinite both rotate-arc;animation-duration:5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.left{overflow:hidden;inset:0 50% 0 0}.right{overflow:hidden;inset:0 0 0 50%}.circle{box-sizing:border-box;border-radius:50%;border:solid calc(var(--_active-indicator-width)/100*(var(--_size) - 8px));border-color:var(--_active-indicator-color) var(--_active-indicator-color) rgba(0,0,0,0) rgba(0,0,0,0);animation:expand-arc;animation-iteration-count:infinite;animation-fill-mode:both;animation-duration:1333ms,5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.four-color .circle{animation-name:expand-arc,four-color}.left .circle{rotate:135deg;inset:0 -100% 0 0}.right .circle{rotate:100deg;inset:0 0 0 -100%;animation-delay:-666.5ms,0ms}@media(forced-colors: active){.active-track{stroke:CanvasText}.circle{border-color:CanvasText CanvasText Canvas Canvas}}@keyframes expand-arc{0%{transform:rotate(265deg)}50%{transform:rotate(130deg)}100%{transform:rotate(265deg)}}@keyframes rotate-arc{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes linear-rotate{to{transform:rotate(360deg)}}@keyframes four-color{0%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}15%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}25%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}40%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}50%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}65%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}75%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}90%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}100%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}}
`;
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
let xt = class extends Nr {
};
xt.styles = [zr];
xt = f([
  I("md-circular-progress")
], xt);
var Mr = Object.defineProperty, Dr = Object.getOwnPropertyDescriptor, M = (o, t, e, r) => {
  for (var i = r > 1 ? void 0 : r ? Dr(t, e) : t, s = o.length - 1, n; s >= 0; s--)
    (n = o[s]) && (i = (r ? n(t, e, i) : n(i)) || i);
  return r && i && Mr(t, e, i), i;
};
let T = class extends C {
  constructor() {
    super(...arguments), this.token = "", this.user = null, this.lang = "en", this.users = [], this.loading = !0, this.error = null;
  }
  connectedCallback() {
    super.connectedCallback(), g.emitLog("Component connected", "info"), V(this.lang).catch((o) => {
      g.emitLog(`Failed to load locale ${this.lang}: ${o}`, "error");
    }), this.unsubLogout = g.onLogout(() => {
      g.emitLog("Logout received, clearing state", "info"), this.users = [], this.loading = !0;
    }), this.unsubLocale = g.onLocaleChange(async (o) => {
      g.emitLog(`Locale changed to: ${o.locale}`, "debug");
      try {
        await V(o.locale);
      } catch (t) {
        g.emitLog(`Failed to change locale: ${t}`, "error");
      }
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), g.emitLog("Component disconnected", "info"), this.unsubLogout?.(), this.unsubLocale?.();
  }
  /**
   * Lit lifecycle: called when properties change
   * This is where we react to token/user/lang changes from the portal
   */
  updated(o) {
    super.updated(o), o.has("lang") && this.lang && (g.emitLog(`Lang property changed to: ${this.lang}`, "debug"), V(this.lang).catch((t) => {
      g.emitLog(`Failed to load locale ${this.lang}: ${t}`, "error");
    })), o.has("token") && (g.emitLog(`Token changed: ${this.token ? "Present" : "Absent"}`, "debug"), this.token ? (g.emitLog(`User: ${this.user?.username || this.user?.email}`, "debug"), this.loadUsers()) : (this.users = [], this.loading = !0));
  }
  async loadUsers() {
    if (!this.token) {
      this.error = "No authentication token", this.loading = !1;
      return;
    }
    try {
      this.loading = !0, this.error = null, this.users = await Vt.getUsers(this.token), console.log("[UserManagement] Loaded users:", this.users.length);
    } catch (o) {
      this.error = o instanceof Error ? o.message : "Failed to load users", console.error("[UserManagement] Load error:", o);
    } finally {
      this.loading = !1;
    }
  }
  async handleDelete(o) {
    const { get: t } = await Promise.resolve().then(() => rr);
    if (confirm(t("messages.deleteConfirm")))
      try {
        await Vt.deleteUser(o, this.token), await this.loadUsers(), g.emitLog("User deleted successfully", "info");
      } catch (e) {
        g.emitLog(`Delete failed: ${e}`, "error");
      }
  }
  render() {
    const o = !!this.token;
    return $`
      <div class="container">
        <div class="header">
          <h1>${x("title")}</h1>
          <md-filled-button @click=${() => alert("Create user form - TODO")}>
            <md-icon slot="icon">add</md-icon>
            ${x("actions.add")}
          </md-filled-button>
        </div>

        ${o ? "" : $`
          <div class="error">
            <strong>${x("messages.notAuthenticated")}</strong>
            <p>${x("messages.pleaseLogin")}</p>
          </div>
        `}

        ${this.loading && o ? $`
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>${x("messages.loading")}</p>
          </div>
        ` : this.error ? $`
          <div class="error">
            <strong>${x("messages.error")}</strong> ${this.error}
            <br><br>
            <md-text-button @click=${this.loadUsers}>
              <md-icon slot="icon">refresh</md-icon>
              ${x("actions.retry")}
            </md-text-button>
          </div>
        ` : this.users.length === 0 && o ? $`
          <div class="user-table">
            <div class="empty-state">
              <md-icon>person_off</md-icon>
              <h3>${x("messages.noUsers")}</h3>
              <p>${x("messages.noUsersDescription")}</p>
            </div>
          </div>
        ` : o ? $`
          <div class="user-table">
            <table>
              <thead>
                <tr>
                  <th>${x("table.id")}</th>
                  <th>${x("table.username")}</th>
                  <th>${x("table.email")}</th>
                  <th>${x("table.created")}</th>
                  <th>${x("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                ${this.users.map((t) => $`
                  <tr>
                    <td>${t.id}</td>
                    <td>${t.username}</td>
                    <td>${t.email}</td>
                    <td>${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}</td>
                    <td>
                      <div class="actions">
                        <md-text-button @click=${() => alert(`Edit user ${t.id} - TODO`)}>
                          <md-icon slot="icon">edit</md-icon>
                          ${x("actions.edit")}
                        </md-text-button>
                        <md-text-button @click=${() => this.handleDelete(t.id)}>
                          <md-icon slot="icon">delete</md-icon>
                          ${x("actions.delete")}
                        </md-text-button>
                      </div>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        ` : ""}
      </div>
    `;
  }
};
T.styles = E`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 24px;
      font-family: var(--font-family, 'Roboto', sans-serif);
      background-color: var(--md-sys-color-background, #fafafa);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      font-size: var(--font-size-3xl, 2rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--md-sys-color-on-background, #1c1b1f);
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      flex-direction: column;
      gap: 16px;
    }

    .error {
      background-color: var(--md-sys-color-error-container, #ffebee);
      color: var(--md-sys-color-on-error-container, #b71c1c);
      padding: 16px;
      border-radius: var(--radius-md, 8px);
      margin-bottom: 16px;
    }

    .user-table {
      background: var(--md-sys-color-surface, white);
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--elevation-1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    }

    th {
      background-color: var(--md-sys-color-surface-variant, #e7e0ec);
      font-weight: var(--font-weight-medium, 500);
      color: var(--md-sys-color-on-surface-variant, #49454f);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--md-sys-color-on-surface-variant, #49454f);
    }

    .empty-state md-icon {
      font-size: 64px;
      opacity: 0.5;
      margin-bottom: 16px;
    }
  `;
M([
  _({ type: String })
], T.prototype, "token", 2);
M([
  _({ type: Object })
], T.prototype, "user", 2);
M([
  _({ type: String })
], T.prototype, "lang", 2);
M([
  J()
], T.prototype, "users", 2);
M([
  J()
], T.prototype, "loading", 2);
M([
  J()
], T.prototype, "error", 2);
T = M([
  I("user-management-app")
], T);
g.emitLog("Web Component registered", "info");
//# sourceMappingURL=user-management.js.map
