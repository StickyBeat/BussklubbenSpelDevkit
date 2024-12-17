import { gsap } from "gsap";

export default () => {
  gsap.registerPlugin({
    name: "directionalRotation",
    init(target, values) {
      if (typeof values !== "object") {
        values = { rotation: values };
      }
      var data = this,
        cap = values.useRadians ? Math.PI * 2 : 360,
        min = 1e-6,
        p,
        v,
        start,
        end,
        dif,
        split;
      data.endValues = {};
      data.target = target;
      for (p in values) {
        if (p !== "useRadians") {
          end = values[p];
          split = (end + "").split("_");
          v = split[0];
          start = parseFloat(target[p]);
          end = data.endValues[p] =
            typeof v === "string" && v.charAt(1) === "="
              ? start + parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2))
              : +v || 0;
          dif = end - start;
          if (split.length) {
            v = split.join("_");
            if (~v.indexOf("short")) {
              dif = dif % cap;
              if (dif !== dif % (cap / 2)) {
                dif = dif < 0 ? dif + cap : dif - cap;
              }
            }
            if (v.indexOf("_cw") !== -1 && dif < 0) {
              dif = ((dif + cap * 1e10) % cap) - ((dif / cap) | 0) * cap;
            } else if (v.indexOf("ccw") !== -1 && dif > 0) {
              dif = ((dif - cap * 1e10) % cap) - ((dif / cap) | 0) * cap;
            }
          }
          if (dif > min || dif < -min) {
            data.add(target, p, start, start + dif);
            data._props.push(p);
          }
        }
      }
    },
    render(progress, data) {
      if (progress === 1) {
        for (let p in data.endValues) {
          data.target[p] = data.endValues[p];
        }
      } else {
        let pt = data._pt;
        while (pt) {
          pt.r(progress, pt.d);
          pt = pt._next;
        }
      }
    },
  });
  // DirectionalRotationPlugin end.
};
