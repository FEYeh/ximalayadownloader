function unknown(e, t, n) {
  "use strict";
  function r(e, t) {
    return (
      (function (e) {
        if (Array.isArray(e)) return e;
      })(e) ||
      (function (e, t) {
        var n =
          null == e
            ? null
            : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
              e["@@iterator"];
        if (null == n) return;
        var r,
          o,
          a = [],
          i = !0,
          c = !1;
        try {
          for (
            n = n.call(e);
            !(i = (r = n.next()).done) &&
            (a.push(r.value), !t || a.length !== t);
            i = !0
          );
        } catch (e) {
          (c = !0), (o = e);
        } finally {
          try {
            i || null == n.return || n.return();
          } finally {
            if (c) throw o;
          }
        }
        return a;
      })(e, t) ||
      (function (e, t) {
        if (!e) return;
        if ("string" == typeof e) return o(e, t);
        var n = Object.prototype.toString.call(e).slice(8, -1);
        "Object" === n && e.constructor && (n = e.constructor.name);
        if ("Map" === n || "Set" === n) return Array.from(e);
        if (
          "Arguments" === n ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
        )
          return o(e, t);
      })(e, t) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
        );
      })()
    );
  }
  function o(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  function a(e, t) {
    for (var n, r = [], o = 0, a = "", i = 0; 256 > i; i++) r[i] = i;
    for (i = 0; 256 > i; i++)
      (o = (o + r[i] + e.charCodeAt(i % e.length)) % 256),
        (n = r[i]),
        (r[i] = r[o]),
        (r[o] = n);
    for (var c = (o = i = 0); c < t.length; c++)
      (o = (o + r[(i = (i + 1) % 256)]) % 256),
        (n = r[i]),
        (r[i] = r[o]),
        (r[o] = n),
        (a += String.fromCharCode(t.charCodeAt(c) ^ r[(r[i] + r[o]) % 256]));
    return a;
  }
  function i(e) {
    (this._randomSeed = e), this.cg_hun();
  }
  // t.getEncryptedFileParams = t.getEncryptedFileName = void 0,
  i.prototype = {
    cg_hun: function () {
      this._cgStr = "";
      var e =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/\\:._-1234567890",
        t = e.length,
        n = 0;
      for (n = 0; n < t; n++) {
        var r = this.ran() * e.length,
          o = parseInt(r);
        (this._cgStr += e.charAt(o)), (e = e.split(e.charAt(o)).join(""));
      }
    },
    cg_fun: function (e) {
      e = e.split("*");
      var t = "",
        n = 0;
      for (n = 0; n < e.length - 1; n++) t += this._cgStr.charAt(e[n]);
      return t;
    },
    ran: function () {
      return (
        (this._randomSeed = (211 * this._randomSeed + 30031) % 65536),
        this._randomSeed / 65536
      );
    },
    cg_decode: function (e) {
      var t = "",
        n = 0;
      for (n = 0; n < e.length; n++) {
        var r = e.charAt(n),
          o = this._cgStr.indexOf(r);
        -1 !== o && (t += o + "*");
      }
      return t;
    },
  };
  const getEncryptedFileName = function (e, t) {
    var n = new i(e).cg_fun(t);
    return "/" === n[0] ? n : "/".concat(n);
  };
  var c = a("xm", "Ä[ÜJ=Û3Áf÷N"),
    u = [
      19, 1, 4, 7, 30, 14, 28, 8, 24, 17, 6, 35, 34, 16, 9, 10, 13, 22, 32, 29,
      31, 21, 18, 3, 2, 23, 25, 27, 11, 20, 5, 15, 12, 0, 33, 26,
    ];
  const getEncryptedFileParams = function (e) {
    var t = r(
        a(
          (function (e, t) {
            for (var n = [], r = 0; r < e.length; r++) {
              for (
                var o =
                    "a" <= e[r] && "z" >= e[r]
                      ? e[r].charCodeAt() - 97
                      : e[r].charCodeAt() - 48 + 26,
                  a = 0;
                36 > a;
                a++
              )
                if (t[a] == o) {
                  o = a;
                  break;
                }
              n[r] =
                25 < o
                  ? String.fromCharCode(o - 26 + 48)
                  : String.fromCharCode(o + 97);
            }
            return n.join("");
          })("d" + c + "9", u),
          (function (e) {
            if (!e) return "";
            var t,
              n,
              r,
              o,
              a,
              i = [
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
                52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
                -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26,
                27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
                43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1,
              ];
            for (o = (e = e.toString()).length, r = 0, a = ""; r < o; ) {
              do {
                t = i[255 & e.charCodeAt(r++)];
              } while (r < o && -1 == t);
              if (-1 == t) break;
              do {
                n = i[255 & e.charCodeAt(r++)];
              } while (r < o && -1 == n);
              if (-1 == n) break;
              a += String.fromCharCode((t << 2) | ((48 & n) >> 4));
              do {
                if (61 == (t = 255 & e.charCodeAt(r++))) return a;
                t = i[t];
              } while (r < o && -1 == t);
              if (-1 == t) break;
              a += String.fromCharCode(((15 & n) << 4) | ((60 & t) >> 2));
              do {
                if (61 == (n = 255 & e.charCodeAt(r++))) return a;
                n = i[n];
              } while (r < o && -1 == n);
              if (-1 == n) break;
              a += String.fromCharCode(((3 & t) << 6) | n);
            }
            return a;
          })(e)
        ).split("-"),
        4
      ),
      n = t[0];
    return {
      sign: t[1],
      buy_key: n,
      token: t[2],
      timestamp: t[3],
    };
  };
  return {
    i,
    getEncryptedFileName,
    getEncryptedFileParams,
  };
}

const t = {
  ret: 0,
  msg: "0",
  trackId: 351162235,
  uid: 219367770,
  albumId: 43164564,
  title: "【塔木德】没钱熬不下去时，就读读《塔木德》",
  domain: "http://audiopay.cos.tx.xmcdn.com",
  totalLength: 3237854,
  sampleDuration: 90,
  sampleLength: 792282,
  isAuthorized: true,
  apiVersion: "1.0.0",
  seed: 8487,
  fileId:
    "32*34*62*9*63*17*38*32*16*2*2*40*65*51*63*55*47*15*62*50*63*12*16*57*65*16*59*11*16*39*60*39*62*30*13*45*25*47*8*44*67*67*25*37*48*54*17*57*15*62*40*10*54*27*23*45*63*",
  buyKey: "FM",
  duration: 399,
  ep: "qz91bol7G3ICgK8NNY4Yt1sMUEog0CiVHtBPKg3gD3z4yO+Q3/yJnvAP1PuJ36VjVeF3",
  highestQualityLevel: 2,
  downloadQualityLevel: 1,
  authorizedType: 1,
  volumeGain: -2,
};

const un = unknown();

const serialize = function (obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};
console.log("un", un);
var m = function (e) {
  return e.indexOf("audio.pay.xmcdn.com") > -1 ? "https://vod.xmcdn.com" : e;
};
var n = t.seed,
  o = t.fileId,
  a = t.ep,
  u = t.duration,
  l = t.domain,
  s = t.apiVersion,
  p = un.getEncryptedFileName(n, o),
  d = un.getEncryptedFileParams(a);
d.duration = u;
console.log("p", p);
console.log("d", d);
var y = m(l),
  b = "".concat(y, "/download/").concat(s).concat(p),
  v = "".concat(b, "?").concat(serialize(d));
console.log("src", v);
