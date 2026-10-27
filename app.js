"use strict";
const $ = s => document.querySelector(s), fa = n => n.toLocaleString("fa-IR");
const gc = () => { try {
    return JSON.parse(localStorage.getItem("mc")) || {};
}
catch (e) {
    return {};
} };
const sc = c => { try {
    localStorage.setItem("mc", JSON.stringify(c));
}
catch (e) { } badge(); };
function badge() { const b = $("#cb"); if (b)
    b.textContent = fa(Object.values(gc()).reduce((a, b) => a + b, 0)); }
function openRecipe(id) { const r = R.find(x => x.id == id); $("#rd").innerHTML = `<button class="btn dark close" onclick="this.closest('dialog').close()">بستن</button><h2>${r.e} ${r.n}</h2><p class="tag">${r.p} · زمان پخت: ${r.t}</p><h3>مواد لازم</h3><ul>${r.i.map(x => `<li>${x}</li>`).join("")}</ul><p><small>و: ${STAPLES}</small></p><h3>طرز تهیه</h3><ol>${r.s.map(x => `<li>${x}</li>`).join("")}</ol>`; $("#rd").showModal(); }
const card = (r, note = "") => `<article class="card"><div class="pimg">${r.img?`<img src="${r.img}" alt="${r.n}">`:`<span>${r.e}</span>`}</div><h3>${r.n}</h3><small>${r.p} · ${r.t}</small>${note}<button class="btn" onclick="openRecipe(${r.id})">دستور پخت</button></article>`;
badge();
if ($("#fridge")) {
    const pick = R[Math.floor(Date.now() / 864e5) % R.length];
    $("#pick").innerHTML = `<small>پیشنهاد امروز مطبخ</small><h2>${pick.e} ${pick.n}</h2><p class="meta">${pick.p} · ${pick.t}</p><button class="btn" onclick="openRecipe(${pick.id})">ببین چطور پخته می‌شود</button>`;
    const all = [...new Set(R.flatMap(r => r.i))].sort((a, b) => a.localeCompare(b, "fa"));
    $("#chips").innerHTML = all.map(x => `<button class="chip" aria-pressed="false">${x}</button>`).join("");
    $("#chips").onclick = e => { const b = e.target.closest(".chip"); if (b)
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") != "true"); };
    $("#go").onclick = () => {
        const sel = new Set([...document.querySelectorAll(".chip[aria-pressed=true]")].map(b => b.textContent));
        if (!sel.size) {
            $("#fres").innerHTML = "<p>حداقل یک ماده انتخاب کن.</p>";
            return;
        }
        const full = [], near = [];
        R.forEach(r => { const m = r.i.filter(x => !sel.has(x)); if (!m.length)
            full.push(r);
        else if (m.length <= 2 && m.length < r.i.length)
            near.push([r, m]); });
        $("#fres").innerHTML = !full.length && !near.length ? "<p>با این مواد غذایی پیدا نشد؛ مواد بیشتری انتخاب کن.</p>" :
            (full.length ? `<h3 style="grid-column:1/-1">با همین مواد می‌پزی (${fa(full.length)})</h3>` + full.map(r => card(r)).join("") : "") +
                (near.length ? `<h3 style="grid-column:1/-1">کمی کم داری</h3>` + near.map(([r, m]) => card(r, `<span class="tag">کم داری: ${m.join("، ")}</span>`)).join("") : "");
    };
    $("#map").innerHTML = P.map(([n, x, y]) => { const r = R.find(z => z.p == n); return `<button style="--x:${x};--y:${y}" class="${r ? "has" : ""}" ${r ? `data-id="${r.id}"` : 'tabindex="-1" aria-disabled="true"'}>${n}</button>`; }).join("");
    const show = b => { const r = R.find(z => z.id == b.dataset.id); document.querySelectorAll("#map .on").forEach(x => x.classList.remove("on")); b.classList.add("on"); $("#prov").innerHTML = `<h3>غذای محلی ${r.p}</h3>` + card(r).replace("card", "card\" style=\"max-width:260px;margin:10px auto;text-align:right"); };
    $("#map").onclick = e => { const b = e.target.closest(".has"); if (b)
        show(b); };
    $("#map").onmouseover = e => { const b = e.target.closest(".has"); if (b)
        show(b); };
    const list = q => { const f = R.filter(r => (r.n + r.p + r.i.join()).includes(q)); $("#all").innerHTML = f.length ? f.map(r => card(r)).join("") : "<p>غذایی با این نام پیدا نشد. نام دیگری امتحان کن.</p>"; };
    list("");
    $("#sf").onsubmit = e => { e.preventDefault(); list($("#q").value.trim()); location.hash = "recipes"; };
}
if ($("#shop")) {
    let cat = "همه";
    const cats = ["همه", ...new Set(PR.map(p => p.c))];
    const draw = () => {
        $("#cats").innerHTML = cats.map(c => `<button class="chip" aria-pressed="${c == cat}">${c}</button>`).join("");
        $("#shop").innerHTML = PR.filter(p => cat == "همه" || p.c == cat).map(p => `<article class="card"><div class="pimg">${p.img?`<img src="${p.img}" alt="${p.n}">`:`<span>${p.e}</span>`}</div><h3>${p.n}</h3><small>${p.c}</small><b>${fa(p.p)} تومان</b><button class="btn" onclick="add(${p.id})">افزودن به زنبیل</button></article>`).join("");
    };
    $("#cats").onclick = e => { const b = e.target.closest(".chip"); if (b) {
        cat = b.textContent;
        draw();
    } };
    draw();
    window.add = id => { const c = gc(); c[id] = (c[id] || 0) + 1; sc(c); };
    const cart = () => {
        const c = gc(), ids = Object.keys(c);
        let t = 0;
        $("#cl").innerHTML = ids.length ? ids.map(id => { const p = PR.find(x => x.id == id); t += p.p * c[id]; return `<div class="row"><span>${p.e} ${p.n}</span><span><button onclick="chg(${id},1)" aria-label="افزودن">+</button> ${fa(c[id])} <button onclick="chg(${id},-1)" aria-label="کم کردن">−</button></span></div>`; }).join("") + `<h3>جمع: ${fa(t)} تومان</h3>` : "<p>زنبیل خرید خالی است. از دکان محصولی اضافه کن.</p>";
    };
    window.chg = (id, d) => { const c = gc(); c[id] = (c[id] || 0) + d; if (c[id] <= 0)
        delete c[id]; sc(c); cart(); };
    $("#cartbtn").onclick = () => { cart(); $("#cd").showModal(); };
}
