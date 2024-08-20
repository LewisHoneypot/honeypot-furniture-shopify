// ufurnish tracking (This only needs to run on product pages)
function sclClickPixelFn() {
  const url = new URL(document.location.href).searchParams;
  if (url.get("a")) {
    const availableParams = [
      "aff_click_id",
      "sub_id1",
      "sub_id2",
      "sub_id3",
      "sub_id4",
      "sub_id5",
      "aff_param1",
      "aff_param2",
      "aff_param3",
      "aff_param4",
      "aff_param5",
      "idfa",
      "gaid",
    ];
    const t = new URL("https://tracker.ufurnish.com/click");
    const r = t.searchParams;
    r.append("a", url.get("a"));
    r.append("o", "50");
    r.append("return", "click_id");
    if (availableParams?.length > 0) {
      availableParams.forEach((key) => {
        const value = url.get(key);
        if (value) {
          r.append(key, value);
        }
      });
    }
    fetch(t.href)
      .then((e) => e.json())
      .then((e) => {
        const c = e.click_id;
        if (c) {
          const expiration = 864e5 * 365;
          const o = new Date(Date.now() + expiration);
          document.cookie = "click_id=" + c + ";expires=" + o;
        }
      });
  }
}
sclClickPixelFn();