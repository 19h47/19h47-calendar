function f(a) {
  const t = a.getFullYear(), e = String(a.getMonth() + 1).padStart(2, "0"), s = String(a.getDate()).padStart(2, "0");
  return `${t}-${e}-${s}`;
}
function g(a) {
  const [t, e, s] = a.split("-").map(Number);
  return new Date(t, e - 1, s);
}
function D(a, t, e) {
  return a <= e && a >= t;
}
function v(a, t) {
  return 32 - new Date(a, t, 32).getDate();
}
function S(a, t, e = 0) {
  return (new Date(t, a).getDay() - e + 7) % 7;
}
function $(a) {
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
class A {
  host;
  constructor(t) {
    this.host = t;
  }
  setFocusDay(t, { focus: e = !0 } = {}) {
    this.host.$body.querySelectorAll(".js-day").forEach((s) => {
      s.tabIndex = -1;
    }), t.tabIndex = 0, this.host.current.day = t.getAttribute("data-day"), e && t.focus(), this.host.current.day && this.host.previewRange(this.host.current.day);
  }
  /** Same day-of-month in the viewed month, or last day if it does not exist (APG). */
  dayInView() {
    const { current: t } = this.host, e = t.day ? g(t.day).getDate() : 1, s = v(t.year, t.month);
    return f(
      new Date(
        t.year,
        t.month,
        Math.min(e, s)
      )
    );
  }
  focusDayByOffset(t, e) {
    const s = g(t);
    s.setDate(s.getDate() + e);
    const n = f(s);
    this.host.current.day = n, this.host.current.year = s.getFullYear(), this.host.current.month = s.getMonth();
    const i = this.host.$body.querySelector(
      `[data-day="${n}"]`
    );
    if (i) {
      this.setFocusDay(i);
      return;
    }
    this.host.render({ focus: !0 });
  }
  sync({ focus: t = !1 } = {}) {
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
  handleKeydown = (t) => {
    const e = t.target.closest(
      ".js-day"
    );
    if (!e)
      return;
    const s = e.getAttribute("data-day"), i = (g(s).getDay() - this.host.options.firstDay + 7) % 7, { key: r, code: o } = t, d = () => {
      e.getAttribute("aria-disabled") !== "true" && (t.preventDefault(), e.click());
    }, h = {
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
    return (h[r || o] || h.default)();
  };
}
const E = {
  active: "active",
  range: "range",
  start: "start",
  end: "end"
}, M = (a, t, e, { disabled: s, selected: n, current: i, tabIndex: r }) => `
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
`, j = (a, t, e) => {
  a.dispatchEvent(
    new CustomEvent("Calendar.change", {
      detail: {
        values: t,
        name: e
      }
    })
  );
}, m = document.documentElement.getAttribute("lang") || "en", y = {
  single: !0,
  firstDay: $(m),
  stateClasses: E,
  locale: m,
  buttonClass: "",
  deselect: !1,
  allowPast: !1
};
class q {
  today;
  day;
  options = y;
  current;
  keyboard;
  el;
  $body;
  $title;
  $next;
  $previous;
  /** Selected days as `YYYY-MM-DD`. */
  picked = [];
  constructor(t, e = {}) {
    this.el = t;
    const s = /* @__PURE__ */ new Date();
    this.today = new Date(s.getFullYear(), s.getMonth(), s.getDate()), this.day = f(this.today), this.options = {
      ...y,
      ...e,
      firstDay: e.firstDay ?? $(e.locale ?? y.locale),
      stateClasses: {
        ...y.stateClasses,
        ...e.stateClasses
      }
    }, this.current = {
      month: Number(
        this.el.getAttribute("data-month") ?? this.today.getMonth()
      ),
      year: Number(
        this.el.getAttribute("data-year") ?? this.today.getFullYear()
      ),
      day: null
    }, this.$title = this.el.querySelector(".js-title"), this.$body = this.el.querySelector(".js-body"), this.$next = this.el.querySelector(".js-next"), this.$previous = this.el.querySelector(".js-previous"), this.keyboard = new A(this);
  }
  init() {
    this.picked = JSON.parse(
      this.el.getAttribute("data-picked-dates") || "[]"
    ), this.render(), this.el.addEventListener("click", this.handleClick), this.$body.addEventListener("keydown", this.keyboard.handleKeydown, !1), this.options.single || this.$body.addEventListener("mousemove", this.handleMousemove, !1);
  }
  destroy() {
    this.el.removeEventListener("click", this.handleClick), this.$body.removeEventListener("keydown", this.keyboard.handleKeydown, !1), this.$body.removeEventListener("mousemove", this.handleMousemove, !1), this.reset();
  }
  move(t, { focus: e = !0 } = {}) {
    const s = new Date(this.current.year, this.current.month + t, 1);
    this.current.year = s.getFullYear(), this.current.month = s.getMonth(), this.render({ focus: e });
  }
  persistPicked() {
    this.el.setAttribute(
      "data-picked-dates",
      JSON.stringify(this.picked)
    ), j(this.el, this.picked, this.options.name);
  }
  setDaySelected(t, e) {
    if (e) {
      t.classList.add(this.options.stateClasses.active), t.setAttribute("aria-selected", "true");
      return;
    }
    t.classList.remove(this.options.stateClasses.active), t.removeAttribute("aria-selected");
  }
  handleClick = (t) => {
    let e = t.target;
    if (e.closest(".js-next") || e.closest(".js-title"))
      return this.move(1, { focus: !1 });
    if (e.closest(".js-previous"))
      return this.move(-1, { focus: !1 });
    if (e = e.closest(".js-day"), !e || e.getAttribute("aria-disabled") === "true")
      return;
    const s = e.getAttribute("data-day");
    return this.keyboard.setFocusDay(e, { focus: !1 }), this.options.single ? e.classList.contains(this.options.stateClasses.active) && this.options.deselect ? (this.picked = [], this.setDaySelected(e, !1), this.persistPicked()) : (this.picked.forEach((n) => {
      const i = this.$body.querySelector(`[data-day="${n}"]`);
      i && this.setDaySelected(i, !1);
    }), this.picked = [s], this.setDaySelected(e, !0), this.persistPicked()) : (1 < this.picked.length && (this.$body.querySelectorAll(".js-day").forEach((n) => {
      n.classList.remove(this.options.stateClasses.range), this.setDaySelected(n, !1);
    }), this.picked = [], this.el.setAttribute(
      "data-picked-dates",
      JSON.stringify(this.picked)
    )), this.picked.push(s), this.picked.sort(), this.setDaySelected(e, !0), this.persistPicked());
  };
  /** Paint in-between days while choosing the range end (mouse or keyboard). */
  previewRange(t) {
    if (this.options.single || this.picked.length !== 1)
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
      const h = d.getAttribute("data-day");
      d.classList.remove(
        this.options.stateClasses.range,
        this.options.stateClasses.end,
        this.options.stateClasses.start
      ), D(h, r, o) && d.classList.add(this.options.stateClasses.range);
    }), n?.classList.add(this.options.stateClasses.start), e.classList.add(this.options.stateClasses.end), i && (n?.classList.add(this.options.stateClasses.end), n?.classList.remove(this.options.stateClasses.start), e.classList.add(this.options.stateClasses.start), e.classList.remove(this.options.stateClasses.end));
  }
  handleMousemove = (t) => {
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
    const t = this.el.querySelector(".js-days"), e = this.getWeekdays(), s = k(this.options.locale, "long");
    t.innerHTML = "";
    for (let n = 0; n < 7; n += 1) {
      const i = (this.options.firstDay + n) % 7, r = document.createElement("th");
      r.scope = "col", r.abbr = s[i], r.textContent = e[i], t.appendChild(r);
    }
  }
  renderHeader(t, e) {
    this.$title && (this.$title.textContent = new Date(
      e,
      t,
      1
    ).toLocaleDateString(this.options.locale, {
      month: "long",
      year: "numeric"
    })), this.$previous?.setAttribute(
      "data-content",
      this.getMonthName(0 > t - 1 ? 11 : t - 1)
    ), this.$next?.setAttribute(
      "data-content",
      this.getMonthName(11 < t + 1 ? 0 : t + 1)
    );
  }
  renderCalendar(t, e, { focus: s = !1 } = {}) {
    const n = this.options.buttonClass ?? "";
    let i = 1;
    for (let r = 0; 6 >= r; r += 1) {
      const o = document.createElement("tr");
      for (let d = this.options.firstDay; d < 7 + this.options.firstDay; d += 1) {
        const h = new Date(e, t, i), p = document.createElement("td"), l = document.createElement("div");
        if (r === 0 && d < this.options.firstDay + S(t, e, this.options.firstDay))
          o.appendChild(p);
        else {
          if (i > v(e, t))
            break;
          {
            const c = f(h), C = c === this.day, w = this.options.allowPast || c >= this.day, b = this.picked.includes(c);
            l.innerHTML = M(c, i, n, {
              disabled: !w,
              selected: b,
              current: C,
              tabIndex: -1
            });
            const u = l.querySelector(
              "button"
            );
            b && (u.classList.add(this.options.stateClasses.active), c === this.picked[0] && u.classList.add(
              this.options.stateClasses.start
            ), this.picked.length > 1 && c === this.picked[this.picked.length - 1] && u.classList.add(this.options.stateClasses.end)), !this.options.single && this.picked.length === 2 && D(c, this.picked[0], this.picked[1]) && u.classList.add(this.options.stateClasses.range), this.renderInner(l, h), p.appendChild(l), o.appendChild(p), i += 1;
          }
        }
      }
      o.childNodes.length && this.$body.appendChild(o);
    }
    this.keyboard.sync({ focus: s });
  }
  reset() {
    this.$body.innerHTML = "";
  }
  render({ focus: t = !1 } = {}) {
    this.reset(), this.renderDays(), this.renderHeader(this.current.month, this.current.year), this.renderCalendar(this.current.month, this.current.year, { focus: t });
  }
  renderInner(t, e) {
  }
}
export {
  q as default,
  g as fromDayString,
  $ as getWeekStart,
  f as toDayString
};
