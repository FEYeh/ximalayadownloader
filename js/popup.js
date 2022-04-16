function prefixZero(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}

const un = unknown();
const getVipAudioUrl = async (trackId) => {
  const data = await getPromise(
    `https://mpay.ximalaya.com/mobile/track/pay/${trackId}/?device=pc`,
    { json: true }
  );
  if (data?.ret === 999) {
    alert(data?.msg);
    return;
  }
  const m = function (e) {
    return e.indexOf("audio.pay.xmcdn.com") > -1 ? "https://vod.xmcdn.com" : e;
  };
  const n = data.seed,
    o = data.fileId,
    a = data.ep,
    u = data.duration,
    l = data.domain,
    s = data.apiVersion,
    p = un.getEncryptedFileName(n, o),
    d = un.getEncryptedFileParams(a);
  d.duration = u;
  console.log("p", p);
  console.log("d", d);
  const y = m(l),
    b = "".concat(y, "/download/").concat(s).concat(p),
    v = "".concat(b, "?").concat(serialize(d));
  return v;
};

const downloadByTrackId = async (trackId, name, downloadNow = true) => {
  // 非vip下载
  const noVipRes = await getPromise(
    `https://www.ximalaya.com/revision/play/v1/audio?id=${trackId}&ptype=1`,
    { json: false }
  );
  console.log("noVipRes", typeof noVipRes);
  if (noVipRes?.data?.isVipFree === false && noVipRes?.data?.isPaid === false) {
    console.log("普通专辑");
    downloadNow && downloadFile(noVipRes.data.src, name);
    return noVipRes.data.src;
  }

  console.log("vip专辑，请先登录");
  const vipUrl = await getVipAudioUrl(trackId);
  vipUrl && downloadNow && downloadFile(vipUrl, name);
  return vipUrl;
};

$(document).ready(function () {
  // 点击获取单个音频
  // https://www.ximalaya.com/gerenchengzhang/19790718/152523144
  $("#getSingleAudioBtn").click(async function () {
    chrome.tabs.getSelected(null, async function (tab) {
      const url = tab.url;

      const params = url.split("/");
      const trackId = params[params.length - 1];
      console.log(`trackId=${trackId}`);

      const dataUrl = `http://www.ximalaya.com/tracks/${trackId}.json`;

      const result = await $.get(dataUrl);
      const title = result.title;
      if (result?.is_free === false && result?.is_paid === false) {
        const href32 = result.play_path_32;
        const href64 = result.play_path_64;

        console.log(`href32:${href32}, href64:${href64}`);
        $("#sigleAudioRecognizeResult").html(
          `<div><h6>${title}</h6></div>
          <div><button id="download32kBtn" type="button" class="btn btn-link" >下载32kps音频</button></div>
          <div><button id="download64kBtn" type="button" class="btn btn-link" >下载64kps音频</button></div>`
        );
        $("#download32kBtn").click(function (e) {
          downloadFile(href32, `${title}-32kps`);
        });
        $("#download64kBtn").click(function (e) {
          downloadFile(href64, `${title}-64kps`);
        });
        console.log("普通音频");
        return;
      }
      const vipUrl = await getVipAudioUrl(trackId);
      $("#sigleAudioRecognizeResult").html(
        `<div><h6>${title}</h6></div>
          <div><button id="vipDownloadBtn" type="button" class="btn btn-link" >下载vip音频</button></div>`
      );
      $("#vipDownloadBtn").click(function (e) {
        downloadFile(vipUrl, `${title}`);
      });
    });
  });

  // 点击获取专辑
  // https://www.ximalaya.com/gerenchengzhang/19790718/
  // http://mobile.ximalaya.com/mobile/v1/album/track/ts-1645836590248?albumId=43164564&device=android&isAsc=true&isQueryInvitationBrand=true&pageId=1&pageSize=10&pre_page=0
  $("#getAlbumAudioBtn").click(function () {
    chrome.tabs.getSelected(null, async function (tab) {
      const url = tab.url;

      const params = url.split("/");
      const albumId = params[params.length - 1];
      console.log(params, `albumId=${albumId}`);
      let albumUrl = `http://mobile.ximalaya.com/mobile/v1/album/track/ts-${
        Date.now() * 1000
      }?albumId=${albumId}&device=android&isAsc=true&isQueryInvitationBrand=true&pageId=1&pageSize=1&pre_page=0`;

      const res = await getPromise(albumUrl);
      const count = res.data.totalCount;
      const iter = Math.floor(count / 200);
      const lastPageSize = count % 200;
      const len = lastPageSize === 0 ? iter : iter + 1;
      let tracks = [];
      for (let index = 1; index <= len; index++) {
        albumUrl = `http://mobile.ximalaya.com/mobile/v1/album/track/ts-${
          Date.now() * 1000
        }?albumId=${albumId}&device=android&isAsc=true&isQueryInvitationBrand=true&pageId=${index}&pageSize=${200}&pre_page=0`;
        const res2 = await getPromise(albumUrl);
        console.log("res2", res2);
        await sleep(500);
        tracks = tracks.concat(res2.data.list);
      }
      tracks = tracks.sort((a, b) => a.orderNo - b.orderNo);
      console.log("tracks", tracks);
      const tbody = tracks
        .map((t, index) => {
          return `
        <tr class="table-download-row">
          <td>${index + 1}</td>
          <td>${t.title}</td>
          <td class="table-download-col"><button id="btn-${t.trackId}" name="${
            t.title
          }" type="button" class="table-download-btn btn btn-link btn-sm">下载</button></td>
        </tr>
        `;
        })
        .join("");

      $("#albumAudioRecognizeResult").html(
        `
        <div><button id="downloadAllBtn" type="button" class="btn btn-link btn-sm" >下载整张专辑音频</button></div>
        <div><button id="downloadAllByThunderBtn" type="button" class="btn btn-link btn-sm" >迅雷批量下载</button></div>
        <table class="table table-hover table-sm">
          <thead class="thead-inverse">
            <tr>
              <th>#</th>
              <th>音频名称</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
          ${tbody}
          </tbody>
        </table>
        `
      );
      tracks.forEach((t, index) => {
        $(`#btn-${t.trackId}`).click(async function () {
          const name = `${index < 10 ? `0${index + 1}` : index + 1}-${t.title}`;
          await downloadByTrackId(t.trackId, name);
        });
      });
      // $("#albumAudioRecognizeAlerts").click(function () {
      //   $("#albumAudioRecognizeAlerts").html("");
      // });
      $("#downloadAllBtn").click(async function (e) {
        for (let index = 0; index < tracks.length; index++) {
          const track = tracks[index];
          const name = `${prefixZero(index, count.toString().length)}-${
            track.title
          }`;
          await downloadByTrackId(track.trackId, name);
          $("#albumAudioRecognizeAlerts").html(
            `<div class="alerts">开始下载-${name}</div>`
          );
          await sleep(1000);
        }
        $("#albumAudioRecognizeAlerts").html(
          `<div class="alerts">专辑音频全部下载完成</div>`
        );
      });
      $("#downloadAllByThunderBtn").click(async function (e) {
        const tasks = [];
        for (let index = 0; index < tracks.length; index++) {
          const track = tracks[index];
          const name = `${prefixZero(index, count.toString().length)}-${
            track.title
          }`;
          const url = await downloadByTrackId(track.trackId, name, false);
          if (!url) {
            return;
          }
          tasks.push({
            name,
            url,
            dir: track.albumTitle,
          });
          $("#albumAudioRecognizeAlerts").html(
            `<div class="alerts">正在获取音频链接${index + 1}-${name}</div>`
          );
          await sleep(800);
        }
        $("#albumAudioRecognizeAlerts").html(
          `<div class="alerts">专辑音频链接获取完成</div>`
        );
        if (thunderLink) {
          thunderLink.newTask({
            tasks,
          });
        } else {
          alert("迅雷插件未加载");
        }
      });
    });
  });
});
function getPromise(url, config) {
  return new Promise((resolve) => {
    $.get(url, function (result) {
      console.log(url, result);
      resolve(config?.json ? result : JSON.parse(result));
    });
  });
}

// 下载
// @param  {String} url 目标文件地址
// @param  {String} filename 想要保存的文件名称
function downloadFile(url, filename) {
  console.log("downloadFile", url, filename);
  getBlob(url, function (blob) {
    saveAs(blob, filename);
  });
}
function getBlob(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send();
}
// 保存
// @param  {Blob} blob
// @param  {String} filename 想要保存的文件名称
function saveAs(blob, filename) {
  var link = document.createElement("a");
  var body = document.querySelector("body");

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  // fix Firefox
  link.style.display = "none";
  body.appendChild(link);

  link.click();
  body.removeChild(link);

  window.URL.revokeObjectURL(link.href);
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

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

function serialize(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
