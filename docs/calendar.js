function m(r, e) {
  return 32 - new Date(r, e, 32).getDate();
}
function y(r, e, t = 0) {
  const s = new Date(e, r).getDay();
  return t === 1 && s === 0 ? 7 : s;
}
function p(r, e, t) {
  return r <= t && r >= e;
}
const v = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], b = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], L = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], C = {
  fr: v,
  en: b,
  ja: L
}, l = {
  ROW: "Calendar__row",
  CELL: "Calendar__cell",
  CELL_ACTIVE: "Calendar__cell--active",
  CELL_CURRENT: "Calendar__cell--current",
  CELL_INNER: "Calendar__cell__inner"
}, k = {
  active: "active",
  range: "range",
  start: "start",
  end: "end",
  name: "calendar"
}, g = (r, e) => `
	<button class="btn btn-outline-primary js-button" data-date="${r}" type="button">
		${e}
	</button>
`, u = (r, e, t) => {
  r.dispatchEvent(
    new CustomEvent("Calendar.change", {
      detail: {
        values: e,
        name: t
      }
    })
  );
}, E = document.documentElement.getAttribute("lang") || "en", f = {
  single: !0,
  firstDay: 0,
  stateClasses: k,
  months: C[E],
  deselect: !1,
  allowPast: !1
};
class A {
  constructor(e, t = {}) {
    this.options = f, this.active = [], this.el = e, this.today = /* @__PURE__ */ new Date(), this.options = { ...f, ...t }, this.current = {
      date: this.today.getDate(),
      month: JSON.parse(this.el.getAttribute("data-month") || this.today.getMonth().toString()),
      year: JSON.parse(this.el.getAttribute("data-year") || this.today.getFullYear().toString())
    }, this.$title = this.el.querySelector(".js-title"), this.$body = this.el.querySelector(".js-body"), this.$next = this.el.querySelector(".js-next"), this.$previous = this.el.querySelector(
      ".js-previous"
    );
  }
  init() {
    this.active = [], this.picked = JSON.parse(this.el.getAttribute("data-picked-dates") || "[]"), this.onMousemove = this.onMousemove.bind(this), this.onKeydown = this.onKeydown.bind(this), this.render(), this.initEvents();
  }
  initEvents() {
    this.el.addEventListener("click", (e) => {
      const t = e.target;
      if (t != null) {
        if (t.matches(".js-next") || t.matches(".js-title"))
          return this.next();
        if (t.matches(".js-previous"))
          return this.previous();
        if (this.options.single) {
          if (t.matches(".js-button") && t.classList.contains(
            this.options.stateClasses.active
          ) && this.options.deselect)
            return this.active = [], this.picked = [], t.classList.remove(this.options.stateClasses.active), u(
              this.el,
              this.picked,
              this.options.name
            ), this.el.setAttribute(
              "data-picked-dates",
              JSON.stringify(this.picked)
            );
          if (t.matches(".js-button"))
            return this.active.map(
              (s) => s.classList.remove(this.options.stateClasses.active)
            ), this.active.push(t), this.picked = [
              parseInt(t.getAttribute("data-date") || "0", 10)
            ], t.classList.add(this.options.stateClasses.active), u(
              this.el,
              this.picked,
              this.options.name
            ), this.el.setAttribute(
              "data-picked-dates",
              JSON.stringify(this.picked)
            );
        }
        if (!this.options.single && t.matches(".js-button")) {
          const s = [
            ...this.$body.querySelectorAll(".js-button")
          ];
          return 1 < this.picked.length && (s.map((n) => (n.classList.remove(
            this.options.stateClasses.active
          ), n.classList.remove(
            this.options.stateClasses.range
          ), !0)), this.active = [], this.picked = [], this.el.setAttribute(
            "data-picked-dates",
            JSON.stringify(this.picked)
          )), this.active.push(t), this.picked.push(
            parseInt(t.getAttribute("data-date") || "0", 10)
          ), this.picked.sort(), t.classList.add(this.options.stateClasses.active), u(
            this.el,
            this.picked,
            this.options.name
          ), this.el.setAttribute(
            "data-picked-dates",
            JSON.stringify(this.picked)
          );
        }
        return !1;
      }
    }), this.$title && this.$title.addEventListener("keydown", this.onKeydown, !1), this.options.single || this.$body.addEventListener("mousemove", this.onMousemove, !1);
  }
  onKeydown(e) {
    const { key: t, code: s } = e, n = () => {
      e.preventDefault(), this.next();
    }, i = () => {
      e.preventDefault(), this.previous();
    }, h = {
      ArrowUp: i,
      ArrowLeft: i,
      ArrowDown: n,
      ArrowRight: n,
      default: () => !1
    };
    return (h[t || s] || h.default)();
  }
  onMousemove(e) {
    const { target: t } = e, s = this.$body.querySelectorAll(".js-button");
    let n = !1;
    if (!t.matches(".js-button") || this.picked.length === 0 || this.picked.length === 2)
      return;
    const i = this.$body.querySelector(
      `[data-date="${this.picked[0]}"]`
    );
    let h = parseInt(this.picked[0].toString(), 10), a = parseInt(t.getAttribute("data-date"), 10);
    h > a && (n = !0, a = parseInt(this.picked[0].toString(), 10), h = parseInt(t.getAttribute("data-date"), 10)), s.forEach((o) => {
      const d = parseInt(o.getAttribute("data-date") || "0", 10);
      o.classList.remove(
        this.options.stateClasses.range,
        this.options.stateClasses.end,
        this.options.stateClasses.start
      ), p(d, h, a) && o.classList.add(this.options.stateClasses.range);
    }), i && i.classList.add(this.options.stateClasses.start), t.classList.add(this.options.stateClasses.end), n && (i && (i.classList.add(this.options.stateClasses.end), i.classList.remove(this.options.stateClasses.start)), t.classList.add(this.options.stateClasses.start), t.classList.remove(this.options.stateClasses.end));
  }
  // onMouseLeave() {}
  renderHeader(e, t) {
    this.$title && (this.$title.innerHTML = `${this.options.months[e]} ${t}`), this.$previous && this.$previous.setAttribute(
      "data-content",
      this.options.months[0 > e - 1 ? 11 : e - 1]
    ), this.$next && this.$next.setAttribute(
      "data-content",
      this.options.months[11 < e + 1 ? 0 : e + 1]
    );
  }
  renderCalendar(e, t) {
    let s = 1;
    for (let n = 0; 6 >= n; n += 1) {
      const i = document.createElement("tr");
      i.classList.add(l.ROW);
      for (let h = this.options.firstDay; h < 7 + this.options.firstDay; h += 1) {
        const a = new Date(t, e, s), o = document.createElement("td"), d = document.createElement("div");
        if (n === 0 && h < y(e, t, this.options.firstDay))
          i.appendChild(o);
        else {
          if (s > m(t, e))
            break;
          if (o.classList.add(l.CELL), d.innerHTML = s.toString(), (this.options.allowPast && a.getTime() !== this.today.getTime() || a.getTime() > this.today.getTime()) && (d.innerHTML = g(a.getTime(), s), o.classList.add(l.CELL_ACTIVE)), s === this.today.getDate() && t === this.today.getFullYear() && e === this.today.getMonth() && o.classList.add(l.CELL_CURRENT), s === this.today.getDate() && t === this.today.getFullYear() && e === this.today.getMonth() && (d.innerHTML = g(a.getTime(), s), o.classList.add(l.CELL_ACTIVE)), this.picked.includes(a.getTime())) {
            const c = d.querySelector("button");
            c && (c.classList.add(
              this.options.stateClasses.active
            ), this.active.push(c), this.picked.length > 0 && a.getTime() === this.picked[0] && c.classList.add(this.options.stateClasses.start), this.picked.length > 1 && a.getTime() === this.picked[this.picked.length - 1] && c.classList.add(this.options.stateClasses.end));
          }
          if (!this.options.single && this.picked.length !== 0 && p(
            a,
            new Date(this.picked[0]),
            new Date(this.picked[1])
          )) {
            const c = d.querySelector("button");
            c && c.classList.add(
              this.options.stateClasses.range
            );
          }
          this.renderInner(d, a), d.classList.add(l.CELL_INNER), o.appendChild(d), i.appendChild(o), s += 1;
        }
      }
      i.innerHTML.length !== 0 && this.$body.appendChild(i);
    }
  }
  /**
   * Next month
   */
  next() {
    this.current.year = this.current.month === 11 ? this.current.year + 1 : this.current.year, this.current.month = (this.current.month + 1) % 12, this.render();
  }
  /**
   * Previous month
   */
  previous() {
    this.current.year = this.current.month === 0 ? this.current.year - 1 : this.current.year, this.current.month = this.current.month === 0 ? 11 : this.current.month - 1, this.render();
  }
  clear() {
    this.$body.innerHTML = "";
  }
  render() {
    this.clear(), this.renderHeader(this.current.month, this.current.year), this.renderCalendar(this.current.month, this.current.year);
  }
  renderInner(e, t) {
  }
  // eslint-disable-line
}
export {
  A as default
};
