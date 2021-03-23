$(document).ready(function () {

  // 点击获取单个音频
  // https://www.ximalaya.com/gerenchengzhang/19790718/152523144
  $("#getSingleAudioBtn").click(function () {
    chrome.tabs.getSelected(null, function (tab) {
      const url = tab.url;

      const params = url.split("/");
      let trackId = params[params.length - 1];
      if (trackId == "") {
        // 是专辑，没有单个音频的id
        return;
      }
      console.log(`trackId=${trackId}`);

      const dataUrl = `http://www.ximalaya.com/tracks/${trackId}.json`;

      $.get(dataUrl, function (result) {
        const title = result.title;
        const href32 = result.play_path_32;
        const href64 = result.play_path_64;
        console.log(`href32:${href32}, href64:${href64}`);
        $("#sigleAudioRecognizeResult").html(
          `<div><h6>${title}</h6></div>
          <div><button id="download32kBtn" type="button" class="btn btn-link" >下载32kps音频</button></div>
          <div><button id="download64kBtn" type="button" class="btn btn-link" >下载64kps音频</button></div>`
        );
        $('#download32kBtn').click(function(e) {
          downloadFile(href32, `${title}-32kps`);
        })
        $('#download64kBtn').click(function(e) {
          downloadFile(href64, `${title}-64kps`);
        })
      });
    });
  });

  // 点击获取专辑
  // https://www.ximalaya.com/gerenchengzhang/19790718/
  $("#getAlbumAudioBtn").click(function () {
    chrome.tabs.getSelected(null, function (tab) {
      const url = tab.url;

      const params = url.split("/");
      const albumId = params[params.length - 2];
      console.log(`albumId=${albumId}`);
      let albumUrl = `https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${albumId}&pageNum=1&pageSize=1`
      $.get(albumUrl, function (tempRes) {
        const count = tempRes.data.trackTotalCount;
        albumUrl = `https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${albumId}&pageNum=1&sort=0&pageSize=${count}`
        $.get(albumUrl, function (result) {
          console.log(result)
          const tracks = result.data.tracks || [];
          const tbody = tracks.map((t, index) => {
            return `
            <tr class="table-download-row">
              <td>${index + 1}</td>
              <td>${t.title}</td>
              <td class="table-download-col"><button id="${t.trackId}" name="${t.title}" type="button" class="table-download-btn btn btn-link btn-sm">下载</button></td>
            </tr>
            `
          }).join('');
          $("#albumAudioRecognizeResult").html(
            `
            <div><button id="downloadAllBtn" type="button" class="btn btn-link btn-sm" >点击下载整张专辑音频</button></div>
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
            $(`#${t.trackId}`).click(function() {
              const dataUrl = `http://www.ximalaya.com/tracks/${t.trackId}.json`;
              $.get(dataUrl, function (result) {
                const title = result.title;
                const href64 = result.play_path_64;
                downloadFile(href64, `${index + 1}-${title}`);
              });
            })
          })
          $('#albumAudioRecognizeAlerts').click(function() {
            $('#albumAudioRecognizeAlerts').html('');
          })
          $('#downloadAllBtn').click(async function(e) {
            for (let index = 0; index < tracks.length; index++) {
              const track = tracks[index];
              const trackId = track.trackId;
              const dataUrl = `http://www.ximalaya.com/tracks/${trackId}.json`;
              $.get(dataUrl, function (result) {
                const title = result.title;
                const href64 = result.play_path_64;
                downloadFile(href64, `${index + 1}-${title}`);
                $('#albumAudioRecognizeAlerts').html(`<div class="alerts">开始下载-${index + 1}-${title}</div>`)
              });
              await sleep(1000);
            }

            $('#albumAudioRecognizeAlerts').html(`<div class="alerts">专辑音频全部下载完成</div>`);
          })
        })
      })
      // 
    });
  });
  
});


// 下载
// @param  {String} url 目标文件地址
// @param  {String} filename 想要保存的文件名称
function downloadFile(url, filename) {
  console.log('downloadFile', url, filename);
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

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}