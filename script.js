let GoogleAuth;
const SCOPE = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';

function authenticate() {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({
      client_id: '844740267850-3hi4bklaonkbbcanqtpmbuqen58t2eku.apps.googleusercontent.com',  // Google Cloudで取得したクライアントIDを記入
      scope: SCOPE
    }).then(() => {
      GoogleAuth = gapi.auth2.getAuthInstance();
      GoogleAuth.signIn().then(onSignIn);
    });
  });
}

function onSignIn() {
  const user = GoogleAuth.currentUser.get();
  const profile = user.getBasicProfile();

  // ユーザー情報を表示
  document.getElementById('user-info').textContent = `こんにちは、${profile.getName()}さん！`;
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';
  document.getElementById('auth-content').style.display = 'block';
}

function signOut() {
  GoogleAuth.signOut().then(() => {
    document.getElementById('user-info').textContent = '';
    document.getElementById('login-btn').style.display = 'inline-block';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('auth-content').style.display = 'none';
  });
}

// 動画検索
function searchVideos() {
  const query = document.getElementById('query').value;
  gapi.client.load('youtube', 'v3', () => {
    gapi.client.youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 5
    }).then(response => {
      const videos = response.result.items;
      let output = '<h3>検索結果</h3><ul>';
      videos.forEach(video => {
        output += `<li>${video.snippet.title}</li>`;
      });
      output += '</ul>';
      document.getElementById('search-results').innerHTML = output;
    }).catch(err => {
      console.error('YouTube APIエラー', err);
    });
  });
}

// YouTube動画のURLから情報を取得
function getVideoInfo() {
  const videoUrl = document.getElementById('video-url').value;
  const videoId = extractVideoId(videoUrl);

  if (videoId) {
    gapi.client.youtube.videos.list({
      part: 'snippet,statistics',
      id: videoId
    }).then(response => {
      const video = response.result.items[0];
      const output = `
        <h3>${video.snippet.title}</h3>
        <p>${video.snippet.description}</p>
        <p>再生回数: ${video.statistics.viewCount}</p>
        <p>高評価: ${video.statistics.likeCount}</p>
        <p>コメント数: ${video.statistics.commentCount}</p>
      `;
      document.getElementById('video-info').innerHTML = output;
    }).catch(err => {
      console.error('動画情報取得エラー', err);
    });
  } else {
    alert('有効なYouTube動画のURLを入力してください。');
  }
}

// YouTubeチャンネルのURLから情報を取得
function getChannelInfo() {
  const channelUrl = document.getElementById('channel-url').value;
  const channelId = extractChannelId(channelUrl);

  if (channelId) {
    gapi.client.youtube.channels.list({
      part: 'snippet,statistics',
      id: channelId
    }).then(response => {
      const channel = response.result.items[0];
      const output = `
        <h3>${channel.snippet.title}</h3>
        <p>${channel.snippet.description}</p>
        <p>登録者数: ${channel.statistics.subscriberCount}</p>
        <p>動画数: ${channel.statistics.videoCount}</p>
        <p>総再生回数: ${channel.statistics.viewCount}</p>
      `;
      document.getElementById('channel-info').innerHTML = output;
    }).catch(err => {
      console.error('チャンネル情報取得エラー', err);
    });
  } else {
    alert('有効なYouTubeチャンネルのURLを入力してください。');
  }
}

// 動画URLから動画IDを抽出
function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// チャンネルURLからチャンネルIDを抽出
function extractChannelId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
