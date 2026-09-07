function y(a) {
  const t = a.getFullYear(), e = String(a.getMonth() + 1).padStart(2, "0"), s = String(a.getDate()).padStart(2, "0");
  return `${t}-${e}-${s}`;
}
function p(a) {
  const [t, e, s] = a.split("-").map(Number);
  return new Date(t, e - 1, s);
}
function m(a, t, e) {
  return a <= e && a >= t;
}
function w(a, t) {
  return 32 - new Date(a, t, 32).getDate();
}
function S(a, t, e = 0) {
  return (new Date(t, a).getDay() - e + 7) % 7;
}
function D(a) {
  try {
    const e = new Intl.Locale(a).getWeekInfo?.();
    if (e)
      return e.firstDay === 7 ? 0 : e.firstDay;
  } catch {
  }
  return 0;
}
function k(a, t = "short") {
  return Array.from(
    { length: 7 },
    (e, s) => new Date(2020, 0, 5 + s).toLocaleDateString(a, { weekday: t })
  );
}
function L(a, t) {
  return new Date(2020, t, 1).toLocaleDateString(a, {
    month: "long"
  });
}
class E {
  host;
  constructor(t) {
    this.host = t;
  }
  setFocusDay(t, { focus: e = !0 } = {}) {
    this.host.$body?.querySelectorAll(".js-day").forEach((s) => {
      s.tabIndex = -1;
    }), t.tabIndex = 0, this.host.current.day = t.getAttribute("data-day"), e && t.focus(), this.host.current.day && this.host.previewRange(this.host.current.day);
  }
  /** Same day-of-month in the viewed month, or last day if it does not exist (APG). */
  dayInView() {
    const { current: t } = this.host, e = t.day ? p(t.day).getDate() : 1, s = w(t.year, t.month);
    return y(
      new Date(
        t.year,
        t.month,
        Math.min(e, s)
      )
    );
  }
  focusDayByOffset(t, e) {
    const s = p(t);
    s.setDate(s.getDate() + e);
    const n = y(s);
    this.host.current.day = n, this.host.current.year = s.getFullYear(), this.host.current.month = s.getMonth();
    const i = this.host.$body?.querySelector(
      `[data-day="${n}"]`
    );
    if (i) {
      this.setFocusDay(i);
      return;
    }
    this.host.render({ focus: !0 });
  }
  sync({ focus: t = !1 } = {}) {
    if (!this.host.$body)
      return;
    const e = Array.from(
      this.host.$body.querySelectorAll(".js-day")
    );
    if (!e.length)
      return;
    const s = (i) => e.find((r) => r.getAttribute("data-day") === i), n = this.host.current.day && (s(this.host.current.day) || s(this.dayInView())) || e.find(
      (i) => this.host.picked.includes(i.getAttribute("data-day") || "")
    ) || s(this.host.day) || e[0];
    this.setFocusDay(n, { focus: t });
  }
  attach() {
    this.host.$body?.addEventListener("keydown", this.#t, !1);
  }
  detach() {
    this.host.$body?.removeEventListener(
      "keydown",
      this.#t,
      !1
    );
  }
  #t = (t) => {
    const e = t.target.closest(
      ".js-day"
    );
    if (!e)
      return;
    const s = e.getAttribute("data-day"), i = (p(s).getDay() - this.host.options.firstDay + 7) % 7, { key: r, code: o } = t, d = () => {
      e.getAttribute("aria-disabled") !== "true" && (t.preventDefault(), e.click());
    }, c = {
      ArrowLeft: () => {
        t.preventDefault(), this.focusDayByOffset(s, -1);
      },
      ArrowRight: () => {
        t.preventDefault(), this.focusDayByOffset(s, 1);
      },
      ArrowUp: () => {
        t.preventDefault(), this.focusDayByOffset(s, -7);
      },
      ArrowDown: () => {
        t.preventDefault(), this.focusDayByOffset(s, 7);
      },
      Home: () => {
        t.preventDefault(), this.focusDayByOffset(s, -i);
      },
      End: () => {
        t.preventDefault(), this.focusDayByOffset(s, 6 - i);
      },
      PageUp: () => {
        t.preventDefault(), this.host.move(t.shiftKey ? -12 : -1);
      },
      PageDown: () => {
        t.preventDefault(), this.host.move(t.shiftKey ? 12 : 1);
      },
      Enter: d,
      " ": d,
      default: () => !1
    };
    return (c[r || o] || c.default)();
  };
}
const M = {
  active: "active",
  range: "range",
  start: "start",
  end: "end"
}, $ = ["single", "range", "multiple"], C = (a, t) => a == null || a === "" ? t : a === "true" || a === "", g = (a, t) => {
  if (a == null || a === "")
    return t;
  const e = Number(a);
  return Number.isFinite(e) ? e : t;
}, j = (a, t) => {
  if (t.mode && $.includes(t.mode))
    return t.mode;
  const e = a.getAttribute("mode");
  return e && $.includes(e) ? e : "single";
}, x = (a) => JSON.parse(a.getAttribute("data-picked") || "[]"), O = (a, t, e, {
  disabled: s,
  selected: n,
  current: i,
  tabIndex: r
}) => `
	<button
		type="button"
		class="js-day${e ? ` ${e}` : ""}"
		data-day="${a}"
		tabindex="${r}"
		${s ? 'aria-disabled="true"' : ""}
		${n ? 'aria-selected="true"' : ""}
		${i ? 'aria-current="date"' : ""}
	>
		${t}
	</button>
`;
class q {
  today;
  day;
  options;
  current;
  el;
  $body = null;
  $title = null;
  $next = null;
  $previous = null;
  #t = null;
  #e = () => {
  };
  /** Selected days as `YYYY-MM-DD`. */
  picked = [];
  constructor(t, e = {}) {
    this.el = t;
    const s = /* @__PURE__ */ new Date();
    this.today = new Date(s.getFullYear(), s.getMonth(), s.getDate()), this.day = y(this.today);
    const n = e.locale || t.getAttribute("locale") || t.getAttribute("data-locale") || document.documentElement.getAttribute("lang") || "en", i = t.getAttribute("first-day");
    this.options = {
      mode: j(t, e),
      firstDay: e.firstDay ?? (i != null && i !== "" ? g(i, D(n)) : D(n)),
      stateClasses: {
        ...M,
        ...e.stateClasses
      },
      locale: n,
      buttonClass: e.buttonClass ?? t.getAttribute("button-class") ?? "",
      deselect: e.deselect ?? C(t.getAttribute("deselect"), !1),
      allowPast: e.allowPast ?? C(t.getAttribute("allow-past"), !1),
      name: e.name ?? t.getAttribute("name") ?? void 0,
      months: e.months,
      days: e.days
    }, this.current = {
      month: g(
        t.getAttribute("data-month"),
        this.today.getMonth()
      ),
      year: g(
        t.getAttribute("data-year"),
        this.today.getFullYear()
      ),
      day: null
    }, this.$title = this.el.querySelector(".js-title"), this.$body = this.el.querySelector(".js-body"), this.$next = this.el.querySelector(".js-next"), this.$previous = this.el.querySelector(".js-previous");
  }
  init() {
    if (!this.$body)
      throw new Error("Calendar: .js-body element not found");
    this.#t = new E(this), this.picked = x(this.el), this.render(), this.el.addEventListener("click", this.#s), this.#t.attach(), this.options.mode === "range" && this.$body.addEventListener("mousemove", this.#i, !1), this.#e = () => {
      const t = {
        values: this.picked,
        name: this.options.name
      };
      this.el.dispatchEvent(
        new CustomEvent("Calendar.change", {
          detail: t,
          bubbles: !0
        })
      );
    };
  }
  destroy() {
    this.el.removeEventListener("click", this.#s), this.#t && (this.#t.detach(), this.$body?.removeEventListener(
      "mousemove",
      this.#i,
      !1
    )), this.reset(), this.#e = () => {
    };
  }
  /** Navigate by `delta` months (negative = previous). */
  move(t, { focus: e = !0 } = {}) {
    const { year: s, month: n } = this.current, i = new Date(s, n + t, 1);
    this.current.year = i.getFullYear(), this.current.month = i.getMonth(), this.render({ focus: e });
  }
  /** Assign selection, mirror `data-picked`, optionally emit `Calendar.change`. */
  setPicked(t, e = !0) {
    this.picked = t, this.el.setAttribute("data-picked", JSON.stringify(this.picked)), e && this.#e();
  }
  setDaySelected(t, e) {
    return e ? (t.classList.add(this.options.stateClasses.active), t.setAttribute("aria-selected", "true")) : (t.classList.remove(this.options.stateClasses.active), t.removeAttribute("aria-selected"));
  }
  #s = (t) => {
    const { target: e } = t;
    if (!(e instanceof HTMLElement))
      return;
    if (e.closest(".js-next") || e.closest(".js-title"))
      return this.move(1, { focus: !1 });
    if (e.closest(".js-previous"))
      return this.move(-1, { focus: !1 });
    const s = e.closest(".js-day");
    if (!s || s.getAttribute("aria-disabled") === "true")
      return;
    const n = s.getAttribute("data-day");
    if (this.#t?.setFocusDay(s, { focus: !1 }), this.options.mode === "multiple") {
      const i = this.picked.indexOf(n);
      return i >= 0 ? (this.picked.splice(i, 1), this.setDaySelected(s, !1)) : (this.picked.push(n), this.picked.sort(), this.setDaySelected(s, !0)), this.setPicked(this.picked);
    }
    return this.options.mode === "single" ? s.classList.contains(this.options.stateClasses.active) && this.options.deselect ? (this.picked = [], this.setDaySelected(s, !1), this.setPicked(this.picked)) : (this.picked.forEach((i) => {
      const r = this.$body?.querySelector(`[data-day="${i}"]`);
      r && this.setDaySelected(r, !1);
    }), this.picked = [n], this.setDaySelected(s, !0), this.setPicked(this.picked)) : (1 < this.picked.length && (this.$body?.querySelectorAll(".js-day").forEach((i) => {
      i.classList.remove(this.options.stateClasses.range), this.setDaySelected(i, !1);
    }), this.picked = []), this.picked.push(n), this.picked.sort(), this.setDaySelected(s, !0), this.setPicked(this.picked));
  };
  /** Paint in-between days while choosing the range end (mouse or keyboard). */
  previewRange(t) {
    if (this.options.mode !== "range" || this.picked.length !== 1 || !this.$body)
      return;
    const e = this.$body.querySelector(
      `[data-day="${t}"]`
    );
    if (!e || e.getAttribute("aria-disabled") === "true")
      return;
    const s = this.$body.querySelectorAll(".js-day"), n = this.$body.querySelector(
      `[data-day="${this.picked[0]}"]`
    );
    let i = !1, r = this.picked[0], o = t;
    r > o && (i = !0, o = this.picked[0], r = t), s.forEach((d) => {
      const c = d.getAttribute("data-day");
      d.classList.remove(
        this.options.stateClasses.range,
        this.options.stateClasses.end,
        this.options.stateClasses.start
      ), m(c, r, o) && d.classList.add(this.options.stateClasses.range);
    }), n?.classList.add(this.options.stateClasses.start), e.classList.add(this.options.stateClasses.end), i && (n?.classList.add(this.options.stateClasses.end), n?.classList.remove(this.options.stateClasses.start), e.classList.add(this.options.stateClasses.start), e.classList.remove(this.options.stateClasses.end));
  }
  #i = (t) => {
    const e = t.target.closest(
      ".js-day"
    );
    if (!e)
      return;
    const s = e.getAttribute("data-day");
    s && this.previewRange(s);
  };
  getMonthName(t) {
    return this.options.months?.[t] ?? L(this.options.locale, t);
  }
  getWeekdays() {
    return this.options.days ?? k(this.options.locale, "short");
  }
  renderDays() {
    const t = this.el.querySelector(".js-days");
    if (!t)
      return;
    const e = this.getWeekdays(), s = k(this.options.locale, "long");
    t.innerHTML = "";
    for (let n = 0; n < 7; n += 1) {
      const i = (this.options.firstDay + n) % 7, r = document.createElement("th");
      r.scope = "col", r.abbr = s[i], r.textContent = e[i], t.appendChild(r);
    }
  }
  renderHeader(t, e) {
    this.$title && (this.$title.textContent = new Date(e, t, 1).toLocaleDateString(
      this.options.locale,
      {
        month: "long",
        year: "numeric"
      }
    )), this.$previous?.setAttribute(
      "data-content",
      this.getMonthName(0 > t - 1 ? 11 : t - 1)
    ), this.$next?.setAttribute(
      "data-content",
      this.getMonthName(11 < t + 1 ? 0 : t + 1)
    );
  }
  renderCalendar(t, e, { focus: s = !1 } = {}) {
    if (!this.$body)
      return;
    const n = this.options.buttonClass ?? "";
    let i = 1;
    for (let r = 0; 6 >= r; r += 1) {
      const o = document.createElement("tr");
      for (let d = this.options.firstDay; d < 7 + this.options.firstDay; d += 1) {
        const c = new Date(e, t, i), f = document.createElement("td"), l = document.createElement("div");
        if (r === 0 && d < this.options.firstDay + S(t, e, this.options.firstDay))
          o.appendChild(f);
        else {
          if (i > w(e, t))
            break;
          {
            const h = y(c), A = h === this.day, v = this.options.allowPast || h >= this.day, b = this.picked.includes(h);
            l.innerHTML = O(h, i, n, {
              disabled: !v,
              selected: b,
              current: A,
              tabIndex: -1
            });
            const u = l.querySelector(
              "button"
            );
            b && (u.classList.add(this.options.stateClasses.active), this.options.mode === "range" && (h === this.picked[0] && u.classList.add(this.options.stateClasses.start), this.picked.length > 1 && h === this.picked[this.picked.length - 1] && u.classList.add(this.options.stateClasses.end))), this.options.mode === "range" && this.picked.length === 2 && m(h, this.picked[0], this.picked[1]) && u.classList.add(this.options.stateClasses.range), this.renderInner(l, c), f.appendChild(l), o.appendChild(f), i += 1;
          }
        }
      }
      o.childNodes.length && this.$body.appendChild(o);
    }
    this.#t?.sync({ focus: s });
  }
  reset() {
    this.$body && (this.$body.innerHTML = "");
  }
  render({ focus: t = !1 } = {}) {
    this.reset(), this.renderDays(), this.renderHeader(this.current.month, this.current.year), this.renderCalendar(this.current.month, this.current.year, { focus: t });
  }
  /** Override to enrich or rebuild each day cell. Keep `.js-day` and `data-day`. */
  renderInner(t, e) {
  }
}
export {
  q as default,
  p as fromDayString,
  D as getWeekStart,
  y as toDayString
};
