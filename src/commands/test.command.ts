import { Command } from 'commander'
import { SpaceDownloader } from '../modules/SpaceDownloader'

const command = new Command('test')
  .description('Test!')
  .action(() => {
    const users = [
      {
        id: '1064352899705143297',
        name: '友人A(えーちゃん)@ホロライブSTAFF',
        screen_name: 'achan_UGA',
      },
      {
        id: '880317891249188864',
        name: 'ときのそら🐻💿',
        screen_name: 'tokino_sora',
      },
      {
        id: '960340787782299648',
        name: 'ロボ子さん🤖ホロライブ0期生',
        screen_name: 'robocosan',
      },
      {
        id: '979891380616019968',
        name: 'さくらみこ🌸',
        screen_name: 'sakuramiko35',
      },
      {
        id: '975275878673408001',
        name: '星街すいせい☄️ホロライブ0期生',
        screen_name: 'suisei_hosimati',
      },
      {
        id: '1062499145267605504',
        name: 'AZKi⚒',
        screen_name: 'AZKi_VDiVA',
      },
      {
        id: '985703615758123008',
        name: '夜空メル🌟@ホロライブ１期生',
        screen_name: 'yozoramel',
      },
      {
        id: '997786053124616192',
        name: '白上フブキ🌽@19時フワンテ年越し',
        screen_name: 'shirakamifubuki',
      },
      {
        id: '996645451045617664',
        name: '夏色まつり🏮NatsuiroMatsuri',
        screen_name: 'natsuiromatsuri',
      },
      {
        id: '996643748862836736',
        name: 'アキロゼAkirose🍎/ホロライブ1期生',
        screen_name: 'akirosenthal',
      },
      {
        id: '998336069992001537',
        name: 'CHAMA❤️‍🔥公式デス',
        screen_name: 'akaihaato',
      },
      {
        id: '1024528894940987392',
        name: '湊あくあ⚓@陰キャップ発売開始！',
        screen_name: 'minatoaqua',
      },
      {
        id: '1024533638879166464',
        name: '紫咲シオン🌙誕生日グッズ発売中っ！',
        screen_name: 'murasakishionch',
      },
      {
        id: '1024532356554608640',
        name: '百鬼あやめ😈ホロライブ2期生',
        screen_name: 'nakiriayame',
      },
      {
        id: '1024970912859189248',
        name: '癒月ちょこ💋@ChocoLoveMV公開しました！',
        screen_name: 'yuzukichococh',
      },
      {
        id: '1027853566780698624',
        name: '大空スバル🚑ホロライブ🍥',
        screen_name: 'oozorasubaru',
      },
      {
        id: '1063337246231687169',
        name: '大神ミオ🌲ホロライブゲーマーズー🐺',
        screen_name: 'ookamimio',
      },
      {
        id: '1109751762733301760',
        name: '猫又おかゆ🍙',
        screen_name: 'nekomataokayu',
      },
      {
        id: '1109748792721432577',
        name: '戌神ころね🥐',
        screen_name: 'inugamikorone',
      },
      {
        id: '1133215093246664706',
        name: '兎田ぺこら👯‍♀️ホロライブ3期生',
        screen_name: 'usadapekora',
      },
      {
        id: '1142975277175205888',
        name: '潤羽るしあ🦋ホロライブ3期生',
        screen_name: 'uruharushia',
      },
      {
        id: '1154304634569150464',
        name: '不知火フレア🔥@ホロライブ3期生',
        screen_name: 'shiranuiflare',
      },
      {
        id: '1153195295573856256',
        name: '白銀ノエル⚔ホロライブ3期生',
        screen_name: 'shiroganenoel',
      },
      {
        id: '1153192638645821440',
        name: '宝鐘マリン🏴‍☠️＠ホロライブ3期生',
        screen_name: 'houshoumarine',
      },
      {
        id: '1200396304360206337',
        name: '天音かなた💫ホロライブ4期生',
        screen_name: 'amanekanatach',
      },
      {
        id: '1200397238788247552',
        name: '桐生ココ🐉ホロライブ卒業生',
        screen_name: 'kiryucoco',
      },
      {
        id: '1200397643479805957',
        name: '角巻わため🐏@ホロライブ4期生',
        screen_name: 'tsunomakiwatame',
      },
      {
        id: '1200357161747939328',
        name: '常闇トワ👾灰色と青歌ってみたあげた！',
        screen_name: 'tokoyamitowa',
      },
      {
        id: '1200396798281445376',
        name: '姫森ルーナ🍬我、姫ぞ(・o・🍬)',
        screen_name: 'himemoriluna',
      },
      {
        id: '1255013740799356929',
        name: '雪花ラミィ☃️オリ曲『明日への境界線』配信開始！',
        screen_name: 'yukihanalamy',
      },
      {
        id: '1255017971363090432',
        name: '桃鈴ねね🍑🥟',
        screen_name: 'momosuzunene',
      },
      {
        id: '1255015814979186689',
        name: '獅白ぼたん♌ホロライブ5期生🌿',
        screen_name: 'shishirobotan',
      },
      {
        id: '1255019046119989248',
        name: '魔乃アロエ【活動終了】',
        screen_name: 'manoaloe',
      },
      {
        id: '1270551806993547265',
        name: '尾丸ポルカ🎪ホロライブ5期生',
        screen_name: 'omarupolka',
      },
      {
        id: '1433657158067896325',
        name: 'ラプラス・ダークネス🛸💜',
        screen_name: 'LaplusDarknesss',
      },
      {
        id: '1433660866063339527',
        name: '鷹嶺ルイ🥀『ラブカ？』投稿したよ！',
        screen_name: 'takanelui',
      },
      {
        id: '1433667543806267393',
        name: '博衣こより🧪ホロライブ6期生',
        screen_name: 'hakuikoyori',
      },
      {
        id: '1433669866406375432',
        name: '沙花叉クロヱ🎣@23時ゆくホロくるホロ',
        screen_name: 'sakamatachloe',
      },
      {
        id: '1434755250049589252',
        name: '風真いろは🍃ホロライブ6期生',
        screen_name: 'kazamairohach',
      },
      {
        id: '1283653858510598144',
        name: 'Mori Calliope💀holoEN',
        screen_name: 'moricalliope',
      },
      {
        id: '1283646922406760448',
        name: 'Takanashi Kiara🐔 NEW SONG w INA 22ND DEC',
        screen_name: 'takanashikiara',
      },
      {
        id: '1283650008835743744',
        name: 'Ninomae Ina’nis🐙holoEN',
        screen_name: 'ninomaeinanis',
      },
      {
        id: '1283657064410017793',
        name: 'Gawr Gura🔱holoEN',
        screen_name: 'gawrgura',
      },
      {
        id: '1283656034305769472',
        name: 'Watson Amelia🔎holoEN',
        screen_name: 'watsonameliaEN',
      },
      {
        id: '1363705980261855232',
        name: 'IRyS💎holoEN「Sparks of Joy」',
        screen_name: 'irys_en',
      },
      {
        id: '1409819816194576394',
        name: 'Tsukumo Sana🪐holoEN',
        screen_name: 'tsukumosana',
      },
      {
        id: '1409784760805650436',
        name: 'Ceres Fauna🌿holoEN',
        screen_name: 'ceresfauna',
      },
      {
        id: '1409817096523968513',
        name: 'Ouro Kronii⏳holoEN',
        screen_name: 'ourokronii',
      },
      {
        id: '1409817941705515015',
        name: 'Nanashi Mumei🪶holoEN',
        screen_name: 'nanashimumei_en',
      },
      {
        id: '1409783149211443200',
        name: 'Hakos Baelz🎲holoEN',
        screen_name: 'hakosbaelz',
      },
      {
        id: '1397148959798226945',
        name: 'Omegaα@holoEN',
        screen_name: 'omegaalpha_en',
      },
      {
        id: '1234752200145899520',
        name: 'Ayunda Risu (リス)🐿@ホロライブID',
        screen_name: 'ayunda_risu',
      },
      {
        id: '1234753886520393729',
        name: 'Moona Hoshinova (ムーナ)🔮@ホロライブID',
        screen_name: 'moonahoshinova',
      },
      {
        id: '1235180878449397764',
        name: 'Airani Iofifteen (イオフィ)🎨ホロライブID',
        screen_name: 'airaniiofifteen',
      },
      {
        id: '1328277233492844544',
        name: 'Kureiji Ollie (オリー)🧟‍♀️@ホロライブID',
        screen_name: 'kureijiollie',
      },
      {
        id: '1328277750000492545',
        name: 'Anya Melfissa(アーニャ)🍂@ホロライブID',
        screen_name: 'anyamelfissa',
      },
      {
        id: '1328275136575799297',
        name: 'Pavolia Reine (レイネ)🦚@ホロライブID',
        screen_name: 'pavoliareine',
      },
      {
        id: '1107557844855844864',
        name: '戌亥とこ🍹',
        screen_name: 'inui_toko',
      },
      {
        id: '1289884632637349888',
        name: '西園チグサ🐬🌱',
        screen_name: 'Chigusa_24zono',
      },
      {
        id: '4080861612',
        name: 'ななかぐら/カグラナナ🌶ねんどろいど受注中',
        screen_name: 'nana_kaguraaa',
      },
      {
        id: '69496975',
        name: 'しぐれうい🌂',
        screen_name: 'ui_shig',
      },
      {
        id: '214708125',
        name: 'あやみ🐾BOOTH通販1月1日予定',
        screen_name: 'ayamy_garubinu',
      },
      {
        id: '30050826',
        name: '飯田ぽち。/IIDA POCHI.＠姉なるもの5巻発売中',
        screen_name: 'lizhi3',
      },
      {
        id: '1110541261809680384',
        name: 'HACHI 🐝 12/29 ブイアワ昼の部出演！',
        screen_name: '8HaChi_hacchi',
      },
      {
        id: '1606596091',
        name: 'nayuta',
        screen_name: '7utauta',
      },
      {
        id: '335139144',
        name: '*Namirin / ＊なみりん@hiatus（休止中）',
        screen_name: 'namirin_2525',
      },
      {
        id: '1265509678466904064',
        name: 'カスカ / VESPERBELL',
        screen_name: 'vesper_kasuka',
      },
      {
        id: '1265506150180622336',
        name: 'ヨミ / VESPERBELL',
        screen_name: 'vesper_yomi',
      },
    ]

    const spaces = [
      // ================================================================================
      // ================================================================================
      // {
      //   screen_name: '',
      //   id: '',
      //   started_at: null,
      //   title: null,
      //   date: '',
      //   playlist_url: '',
      // },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'tokino_sora',
        id: '1OwxWzDgmZwJQ',
        started_at: 1640965759981,
        title: 'ときのそら初のスペース',
        date: '20211231',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/4qN3sEM0QwVHEeZxa_UG2GEY-BNrzMmO2n0FgfZkbIM98baPFGKhTN9RTDwq9_qTOMhfqaz0yEQVySoqzRCGrg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'tokino_sora',
        id: '1dRKZlDpkjaJB',
        started_at: 1640966766381,
        title: 'ときのそらスペースに苦戦する',
        date: '20211231',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/h9MBbUdsO89x-1No2SuE875Jym6r1O0aTfoTJNSJ2ZmAliWwyqtyO1Amdo_fCatIHS_xprITbGrvsUsJScoGHQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'robocosan',
        id: '1jMJgeMkYklKL',
        started_at: 1640768433583,
        title: '酔い覚ましベッド中継',
        date: '20211229',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/Ye-OpLaveupKN0KEqj8LAeyYLzFXmxN8QSI3xlXYfWgfNzGUaEoepkqYibXcBg3jrO_XTI1D7vCSagiHCWtvkQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'sakuramiko35',
        id: '1YpKkZOkyLwxj',
        started_at: 1634651936948,
        title: '#みこぺーす生活音たれ流します',
        date: '20211019',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/MeiMWoWBCqzN6QD7fFnuonfxfoo9zBFZoESE6tfNBPohxuLp-4A-q_inmWu41zOIWH2qezPh-ikF1QI2rCYVJw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'sakuramiko35',
        id: '1ypKdEaZeRoGW',
        started_at: 1638010077329,
        title: '夢の国がたのしみすぎてスペースするみこ',
        date: '20211127',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/WljtAAyNCN-z76xHwL1IluzspR77Z8whwSVlNYnx4IKcdcZaetePrmQueQxV1posnZBVQRafnzqXriN_bMXYQw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'sakuramiko35',
        id: '1ZkKzbzDnlaKv',
        started_at: 1638081931968,
        title: 'うあわああああああああああぉあ',
        date: '20211128',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/Mh3XevKmXSsyuqgbzWt05O1RNemEoOIEhjROxTNKoZFQWvRczSOIjlPyuwymsUnKehwBNYyQqFTtPx3Z-TFSbQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'sakuramiko35',
        id: '1OyJADzXVWMGb',
        started_at: 1638194498870,
        title: 'ミオスバみこ 温泉宿からにゃっはろ〜♨️',
        date: '20211129',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/yFzZbxe2WzGvkSCnv5jxEVxHOtwZ0UFMeRVarQHe4ByERDiIwRne0OMMtdkcSO9yeC-mjpmGEL39j9WkYY1upQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'sakuramiko35',
        id: '1nAKEYwNvyaKL',
        started_at: 1640946325482,
        title: 'ホロライブ取れ高大賞をみかんと鍋を食べながら観るスペース',
        date: '20211231',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/UUNtgVv97rriYLSnr2GuKRixqFRATxd2PQV22L0gqIMiUIHWmqoTt_AkZR0AFInL0blathHuTteQaL93zI7org/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'suisei_hosimati',
        id: '1YpJkZbnLVPGj',
        started_at: 1637660262238,
        title: 'ダイヤモンドをダウンロードしたら終わる',
        date: '20211123',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/aAjMD6LaYQ3goqAhzOYPZg5bh-BRD2BC-hyOsRzqv8dWyg_Hj-_9opgQipywwYgZmxLaOat7StGCzAIFZyp-rA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'yozoramel',
        id: '1lPKqmjbZPLKb',
        started_at: 1639755177502,
        title: '#スペース子兎音 お酒のんだ！！からテンション高い！',
        date: '20211217',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/13OR4oq8d5TQMZIQapd7i-W5svOPSixXGmpsvkTTNibrjikEBrx12QSBznQetFRvmoDDgFhtA2r0Rx3NPvHP4A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'shirakamifubuki',
        id: '1MYxNnRvmnZxw',
        started_at: 1636539280827,
        title: 'サイン書きながらのんびり  #FBKSPACE',
        date: '20211110',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/doP2-wySZBDGlG038ef_aDPEMWpqcaXVxNS6uIek8XkkVwQASCRyIF-h6fYHghTCClu1LECvCtbkDuuM4Kpa6w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'shirakamifubuki',
        id: '1ypKdEDXBjrGW',
        started_at: 1635057635548,
        title: '菊花賞同時視聴  #FBKSPACE',
        date: '20211024',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/huuxT6Dxr-BBb1Xx5tqMjG4NHMZfsQf47e7YsZZDbFgwySFJ1cYqYRMD2Ubu9DUiPViWc2Kxjld3Ui7g_RoAmg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'natsuiromatsuri',
        id: '1yNGaWpbVQQxj',
        started_at: null,
        title: null,
        date: '20210527',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/E2iot0n3CMPrkdBrsf2mBZdvoZb6mvaVHlKLy8Kriww5Mi_ItgaIB4UdvCg0CtyapoSTlbhm9sfSfyKxQ1d16A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1mnGeaQaXwaGX',
        started_at: null,
        title: null,
        date: '20210608',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/AgEcisCDHtJOdPafWlD9_XOQeNkPAj87HMLygu55ww4PkwjAbalWfturQkB3OnG44qAWuPITewnFpPKi45gwrw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1PlJQPNnPonGE',
        started_at: null,
        title: null,
        date: '20210613',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/CaYvfNR8N-kTX0XzC4T9g3Fcu6uv3l6uD0oz7etyqlk8n1z25jriDhcCk49hLrpi_QFbA299-2CruV90fWJrzg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1vOGwEkpNZRxB',
        started_at: null,
        title: null,
        date: '20210615',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/gP8rCQjoZGukEPCt30NsuX1Jd-QQpWbXwr3aWM0_s4H2TcqasKA8lR5o6RHgA0x6N_h-_D8ehZlPC44AsajBvA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1nAKELAYbzZxL',
        started_at: null,
        title: null,
        date: '20210621',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/QmcJJntO03w72BHkqkdUODFIS5CApR6kpwwvdQ7yitOG8L2ysLYJmgyJkER6ZS42hE2wZmcu_-cZQElEwIymrw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1BdGYYnZeBDGX',
        started_at: null,
        title: null,
        date: '20210624',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/eH4PSOkbVS3VnLVqOuXFNNQmLFMo7E0TMfT9QS6uuePvgLPpQx00cwtYVgXMFC5EI8o_YkS1FUXYGGp8BUy2fA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1nAJELLXzPkGL',
        started_at: null,
        title: null,
        date: '20210626',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/gyBouW5mm3tr6gEXuD_hRI8cU2HQDr5d2xu6LLG1B6ZI5AZXGFQKc1J3ISPUrgHR5AB9ffwMNHfjYf_h47-KfA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1jMJgpppgnyxL',
        started_at: null,
        title: null,
        date: '20210705',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/zubHeF4gRqiEbPN3vSxJ0VVlms7SjuOK62P2j0eXGkpiL3Q2s9mCKF3c4VZnHCpm8oCcRmTJpy-FCvbCcbS--w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1vOGwEyLjzmxB',
        started_at: null,
        title: null,
        date: '20210710',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/LOiG0P89V_VKKItIhU82m_q3vp0J3xxEspImaGYKdpbZJfC2_Lv_pIPv-ULFPehbOX8fmhMPHogj5v73OTqqbQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1OyKAEDvONOKb',
        started_at: null,
        title: null,
        date: '20210714',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/zL9w6nRsBVhI-uwdyH3LEAsS5iQoWMcwae0uQlCJXuIoogoLYg0J9ZPdVEGC7N7QoQFpvkHif6Di74ZEcFAmjQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1zqJVXBNXWmKB',
        started_at: null,
        title: null,
        date: '20210715',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/VzRrMvw7GTW8GKD77PLIYUw7kIktiDFPcvUCezQUWKdwqFp95qohPRPiCa7LbXNGo6Y0zBDT4Byj85i4Q3tXgA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1lDGLpnZEEmGm',
        started_at: null,
        title: null,
        date: '20210724',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/PjSLQVp0_RuVBv_STS1gAY4ahlcK0IVtgCjQVUBdvU5-Urfqge0CxIdjqQDEnLG0Vcuvhv8F1_6-wvh-4QyrXw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1MYxNnrebkvxw',
        started_at: null,
        title: null,
        date: '20211009',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/3nUst8mzyccho4pJjQP3EKrlOELI1xtBTEluUxdTbX1YTautGRVk7XbRLBln19qlVS7rNyTr_fDJ8hMa_wQxgw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1jMJgeMAgYOKL',
        started_at: 1640235369418,
        title: '起きてメイクする #まつりスペース',
        date: '20211223',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/Uu1UrSc4MxiPLfHEc8xlj8_-9s5281OMqb2eVllzfnSmR4HYx0aLmQdHKueeg24Eun9l8lHYKRqxF8QnMzfFPQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1ZkKzbQEEbyKv',
        started_at: 1640302016176,
        title: 'メイクするだけ #まつりスペース',
        date: '20211223',
        playlist_url: 'https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/SrDFrklO1YtPHAe-YXLzxT_0IYfuSXRWBXFkwzhhXksI78LNRT5_fm3O_aHfrGsSpcViZdNlKIPrx9qNeaLiQw/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1BdxYwbvmblGX',
        started_at: 1640326818846,
        title: 'わっとがくるまで #まつりスペース',
        date: '20211224',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/JeywfScxZTAFnNgoJl1wl7iY5nvzu-STV80dJIzB9tMHQm-jTS0RYovN4b20S-eWqEarBHEOy-eI0X3uDHvAiw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1zqJVBorgVAJB',
        started_at: 1640408686896,
        title: 'ちょこてんてーがごはんつくってる #まつちょこスペース',
        date: '20211225',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/zXHxQgRxGCvy4eu9aKEkRWGsRpvD4AChBimVXkNICK_2UyxcQabIHOn9q1ltjDDKLYdULuyENqXnv-WCaLsdWg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1eaKbNyAMjnKX',
        started_at: 1640526393645,
        title: '洗濯物やる気出ないからスペースでやる気出す #まつりスペース',
        date: '20211226',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ZW9DKTtp01PQjjjjibyx_2nRDC92Xc-sN4nm0fb-Zy1g3khaJgUgVyuwesO83yez6Bc96Xpk7dS4SAfJSe2EvA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1gqGvlWoEROxB',
        started_at: 1640625799308,
        title: 'ミーティングしてたらこんな時間になったときの俺の気持ち #まつりスペース',
        date: '20211227',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/HH4-rEgqEA2cA-7SjXWdCXHbIOmEjwqhJP5NuKjVKtxhMr6j48HY7IP0-CrxmMnolpAF4l-Vu37whJFCiFUQtw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1ZkKzboMzbaKv',
        date: '20211229',
        started_at: 1640806235681,
        title: 'すこし #まつりスペース',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/RpmqJ-8ZbnWKvUXdnAIiNVVg5jOgKh9UXp-ati_0Km7tLj1CeZ5hc6N_jqCu6JRfkvkp3aZsqszlsGE0dcScyQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'natsuiromatsuri',
        id: '1yNGaYlzYBVGj',
        started_at: 1640937323907,
        title: '怠惰な年末 #まつりスペース',
        date: '20211231',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/shWsqf7xjFphAmPwoz-XbI0KiafpZJrB_SHTow7V26kvjd_fQco9zuS3Rc27YnLhfdVQzA1LhvT5s-mFFvozag/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'akirosenthal',
        id: '1nAKEYvPgWbKL',
        started_at: 1634833246264,
        title: 'アキロゼはじめてのスペースやってみる',
        date: '20211021',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/fJPPNAMyRgKjJhI43_DqT5Km5dAIZlBNo2YemHHKKq47dZheebO45mnAtAHvmzK8dqq_1QBMGNR2WxZ3UcoeMQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akirosenthal',
        id: '1DXxyDQwWXvJM',
        started_at: 1639923400245,
        title: 'お風呂から #アキロゼのスペース',
        date: '20211219',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/MMVwsv4MXBh_9ivSC5vWHt68XpATGLj6J2IGL3Q5ciq6xcle1Bq24NC4HH9cyv94aYeTyztQCD2tadfJYK2uag/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'akaihaato',
        id: '1ZkJzbPlPLoJv',
        started_at: 1634923061898,
        title: 'はあちゃま、スペースに眠りを捧げる。',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/zzuoduPI4ScRIEihN0LUoyY9oXhydR4AYZ6piO8JwkXSQPzhXWYd-u386XqEHlJppSelczr-DpgpQyjye2Irag/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1ynJOZQrgeXGR',
        started_at: 1634923272468,
        title: 'はあちゃま、スペースはじめて。こわい。',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/pNlE0PtUKOzl9iKlCLeLuw7iT6BOFWeO3aVgz7bgQZv3zkhYw22KuDQBQN3n009gHAWn60lZwgArE9cXZ0T-xA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1RDxlgVOXpEJL',
        started_at: 1634923297876,
        title: 'はあちゃま、スペースはじめて。こわい。',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/SAsVGk3tFFUbUz4JNnAkbpcQdKxU4KFuYRNYNgLwitGo60OO_2xYfRO9ucnr965Q6WUE4d0Tg6bLKOI2Zla4cA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1ZkKzbPnzQWKv',
        started_at: 1635001685241,
        title: '#シコタマ寝れるはあちゃま',
        date: '20211023',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/G85v6582DAgPNzv4xxiZEDsOShs3EMj2_WXTqf6n8EGlInfADeQzA7b5EDz2a0n9LmKiNR_7ubCYNIc-wB0y5A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1djGXPbyNVdGZ',
        started_at: 1635691483198,
        title: '#はあちゃまハロウィンちょいとだけ',
        date: '20211031',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/D-iBB_z9qigiKpJkIT5aje6myzJ7e4MotMLajLb4xU5STwM5xZeO90rRpXP5isnFl8EaKNfQ0Xy5bAJJp9fXIA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1RDGlgXMynlKL',
        started_at: 1635691757293,
        title: '"#はあちゃまハロウィンうあ',
        date: '20211031',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/YGlN7LpiLEkzBjQ6EAZ-eXBpa1TszlZA8tSlX9R-aWYROhjl_WMExnqLw7jDz0Lf9RNwX8ELyHBKaYcc-fMX-w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1OdKrBlYnXVKX',
        started_at: 1635800956645,
        title: '#朝はあちゃまっちゃまっちゃま 🤪☝️💫',
        date: '20211101',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/HfLIujeYB_lOVNkHQZea8FocRyJSuh6lpdYmV2JO-IBoa_kM4u4DxMTxemozDQlmfuqoGNZP8jhTr0CYiVQa3w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1RDxlgDDRqVJL',
        started_at: 1638205115061,
        title: '#はあちゃま中毒 ←コメ欄これ！',
        date: '20211129',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/nmxhoZedequntdXvnTZcByoH3_q4q22TJD9pAkAtJb-IKgnc0twqUtz7ik4indSFj0tUt_EctHBVHbeHz2X_2Q/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1ynJOZXngOyGR',
        started_at: 1640011008247,
        title: '#はあちゃますぺーす臭 ( •́ฅ•̀ )',
        date: '20211220',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/pVRnilR4RxnlGlX6iyhNyGJs03geXH24ZA2pkTsI7NZKrM2ceIOhcK2uK9zowedukfe50R-UP8nEAZrFIpUIow/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1ynJOZXjOWqGR',
        started_at: 1640344238563,
        title: '#寒くて冬眠しようと思ったら全裸だった時の対処法',
        date: '20211224_1',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/BG5ao-LM84sjeIblmB5kPCa6a0bKeTG5sOhLLtpjIH-7DqyHVv0hBnEexoZkYH8FMkWql5CgxEOpEPxiauFTTg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1gqxvlWbnlqGB',
        started_at: 1640344535999,
        title: '#はあちゃますぺーす草',
        date: '20211224_2',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/BG5ao-LM84sjeIblmB5kPCa6a0bKeTG5sOhLLtpjIH-7DqyHVv0hBnEexoZkYH8FMkWql5CgxEOpEPxiauFTTg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'akaihaato',
        id: '1BRJjnMWqqjJw',
        started_at: 1640345964731,
        title: '服着て参戦 #ちゃまかわええ',
        date: '20211224_3',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/s8kAahrx1jPQp7qgwuDwqWmt6LvVmG1j-oDoVS85p13pisP1AT0ZLXc-5hzDh-6aqFGUofw39ktYEyKqME9S5g/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'minatoaqua',
        id: '1LyxBoYBOMYKN',
        started_at: 1640335932556,
        title: 'はじめてのスペース',
        date: '20211224',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/y7wW51BRRIsoMfNbAn58Y0Zob0gFkRAthfXG_QZ387cuNqJ8uSQlpBkhrJOtr1HhooELQsTJFig_2f-OR12IgA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'nakiriayame',
        id: '1yoJMWvbybNKQ',
        started_at: 1633612289669,
        title: '初めてのお試し😳副反応でちょっと微熱気味🤒🤒#なきりスペース',
        date: '20211007',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'nakiriayame',
        id: '1BRJjnMoYPBJw',
        started_at: 1640110726831,
        title: 'おはなし #なきりスペース',
        date: '20211221',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/PbiS3ddPLFHjo-75g8JXutkbFNYE3_Q8UXVfuIk5GE91edE5Sux-kBZgg9kV0QpMyA6Z0ITsMMioKcqlMUvjQA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'yuzukichococh',
        id: '1vAxRkewRWZKl',
        started_at: 1639668813902,
        title: '#ちょこのスペース',
        date: '20211216',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/dlQ0gIUeURNKtKWLyoF8z0q2rRiBAcct1SXQgKabCiewvPzuIvffoGq52vxmo-DmR3o81YVyGkuHWKFAVfkXTg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'yuzukichococh',
        id: '1dRJZlvENeVKB',
        started_at: 1639758593214,
        title: '#ちょことね',
        date: '20211217',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/eP536ERakr1HSnjcWv8QtY9Cr3ygcn8x9fKFX7xipx6ymO_bcHAkDgjeVFb0e9JO25SUj5QLc6iB1jeJymlA4w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'yuzukichococh',
        id: '1ypKdEegojaGW',
        started_at: 1640617907208,
        title: '#ちょことねスペース',
        date: '20211227',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/TKFIWStdadDoWOgAM3OcWkOZ1fEtSIwDlLVzR4s4N-br02j5dbGDlA-Morz4D9KB2w9CnndEiooiSS7ZlSUwxA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'yuzukichococh',
        id: '1dRJZlyEERVKB',
        started_at: 1640715011213,
        title: '#ちょこの深夜ラーメン会',
        date: '20211228',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/MPa2HuwPRCL7Bp-I2ZNagedvP_cBpU35lGS2duLzwAO29rHj3hourlwOaZKBmx3QJMxCf4GxPm8vKzHw2jZZ8Q/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'oozorasubaru',
        id: '1lPKqmroAMlKb',
        started_at: null,
        title: 'スバルのすぺーす',
        date: '20211015',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1V34e1kBuR1wShGEK5RGqPsvnmr9Nq9NZD0qzgVexfu5UCRWIgFEVNlL5GEsrlWUS_2gfOU7Ya96VW3jbe2zXA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'oozorasubaru',
        id: '1lDxLLYnjOaxm',
        started_at: 1637146893766,
        title: '#スバルのすぺーす',
        date: '20211117',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/q_8WCk2tApXtCt_DVW8kIXZTAZnsiNjpOiZPDCwph1mkHeZAu1vT41DihYVzR3H4a2ftirRfUbLQ-g6NvlSzkQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'oozorasubaru',
        id: '1OdKrBazypnKX',
        started_at: 1637147119568,
        title: '#スバルのすぺーす',
        date: '20211117',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/F3udFsul0L2Yh69KNYAvfJ5afqYzN-lhEDJnBzsCfDsKwaBXaMet7lpQ-F8xFQ3FWvNitZdI9JH3G107g_W1vQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'oozorasubaru',
        id: '1eaJbNZkQDvJX',
        started_at: 1639054939806,
        title: '#スバルーナ',
        date: '20211209',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/SE1wnttrtgIHoJej84ZQUM0AEz_N55RInh-UQJJ5CNCeoBFCzE8m0l38jnsyFT8XtFMrQPksZlgOTqSY2j-y3A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'oozorasubaru',
        id: '1ypJdEjzOmrxW',
        started_at: 1640931059663,
        title: 'スバルの年越しそば屋さん',
        date: '20211231',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/-K-K6RwQcGVW3g3oV_MXazeRJEDLWEw7wOpKosl9JsDKSl6lBg9BpbQSai5PKT56KPeLh8nLG104ktER5zCVkg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'ookamimio',
        id: '1mrxmapbqAkxy',
        started_at: 1634965114781,
        title: 'ミオのスペース(初めて)',
        date: '20211023',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/Wkv5AsM2ErLPmbbJ2jiVJIrdQJ6yFRgR5pEh0SI-380q8R9GeM3d6d2w6HFu6MHYMnnqF-qcR1oCSZGyqJyZ-Q/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'ookamimio',
        id: '1lPKqmPaMYNKb',
        started_at: 1638137864971,
        title: '朝ミオ温泉♨️寝起き凸',
        date: '20211128',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/sVSw-wguapBGHnabdDTiOhJRdR4knR7H0L7OKdTI8rS1oY_-78jiyijvrtCQhSmok6-owwb9ve9NT04ukmGucg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'nekomataokayu',
        id: '1vAxRkZavWZKl',
        started_at: 1634731180123,
        title: 'はじめてのスペースってやつです。 #おかゆのスペース で呟いてね:(っ`ω´c):',
        date: '20211020',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/k5wFInyTJsAtTbws9cI5IjCCQobrDpuXfmfEfcbJFREx_jyVDYNzfLBu46FF2Re4Bc_nSeUqudZjSLtlhCJwiA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'inugamikorone',
        id: '1djGXPByYlkGZ',
        started_at: 1634907606500,
        title: 'ころね、はじめてのスペース★',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/0TQFEREyxfDaBc4LkG-63bbNBLEQoQ8yAE70bMGKSXG0t63yhOmdWdWF5suezDKjSh5Z80dh9v5hRoYOCoLJoQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'usadapekora',
        id: '1YpKkZPZyErxj',
        started_at: 1638788435665,
        title: '初スペース！！猫と遊んだりするぺこ！！！',
        date: '20211206',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/zXss4Ymh_WosSEpMnI1fIv7xgURPHQIVk7FuST_sSmUP-xk06QmZbEAYD1E9cryHXVDyc1H31FHjmlA_BHkdUQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'amanekanatach',
        id: '1rmxPgZyPmqJN',
        started_at: 1635435095382,
        title: '#かなたんすぺーす',
        date: '20211028',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ZYktYcqA3Dz38lC0KQ1LbzKQkXj_vEBDEtYeV9opdjztd_-TjyP0UentqxczvyxQ_Ou9edpzIPvE8L1-m_0NRQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'amanekanatach',
        id: '1eaJbNMzazvJX',
        started_at: 1637072594907,
        title: '#かなたんすぺーす',
        date: '20211116',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/_0J64rcvAEwduN7fbuexPNkdyaczpUiesFYrxc5uCznTqzWV3RtHueMlVzRmrdrkUympzrIg70iQ8ukm-u7mEQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'amanekanatach',
        id: '1RDGlgjrzarKL',
        started_at: 1637073137115,
        title: '#かなたんすぺーす',
        date: '20211116',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/CWJP08-0O7zqeNEk3fAWVxI03mSFlAKzF_hlSQWGUTa-my-QZNNsDpRcY_A8rq7zRJ65YM1T-wOWDP7n5py-Eg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'amanekanatach',
        id: '1yoJMWQaoXoKQ',
        started_at: 1637850164957,
        title: '#かなたんすぺーす',
        date: '20211125',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/G4a-bblxQEkzGhc9y5rSUCGGPt1PN0ICi6Zc0ws6fWsGl-HCqgJRqxTDmGAjZi8DHRUmfHTqu5qGrQzlv2egzA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'tokoyamitowa',
        id: '1dRKZlWAPLAJB',
        started_at: 1636813634058,
        title: '#towaoffspace',
        date: '20211113',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/A-jRwmvKIvkyhJdnzNqVlM7t_JQyFFdXMcnO8jshhnkrZhqGp8-89d4iyJIh8n5YUS9E04jqd8s16SPRkr8tzA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'tokoyamitowa',
        id: '1eaJbNyPngZJX',
        started_at: 1640313076364,
        title: '#眠いトワ様',
        date: '20211224',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/d2hAxYU6E-ld5juNYu-hryo8ePvMgWzbUisM50YOPhOTZoCOPPpu0Mqk7I0GsUlcHi4uqun2XR0MnIZ4KPrw1g/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'LaplusDarknesss',
        id: '1BdxYwmNwmQGX',
        started_at: 1638397886041,
        title: '朝',
        date: '20211201',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/CWpvs3wnSXjteAJQif17jwgCJK1CuXi_5yJjRcR-cI7W0a_QUcI_SyLF4dqoYofZJfhg7aoUc5VpDaLwhS8-oQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1yoJMWneoZwKQ',
        started_at: 1638484281738,
        title: 'おはよう',
        date: '20211202',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/hnyEoSkuLQwHFd8WR-CCOAE_1GUK5e4A2YJ_Twk7chq0vE6Xl4fdvcOV2o1_y1vU4QpYgOQiCg9qk3P0MWQm6w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1mnxedDvzjPJX',
        started_at: 1638659534709,
        title: 'おは',
        date: '20211204',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/YRSsw6_P5xUZHMualK5-ihvePR6o4QmoZVOBGicKvmkL_KB9IQYtxVqm3P_vpZ2HnFkoRfar4_uJOjqC8OCo5A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1MYxNnvnkabxw',
        started_at: 1638801623757,
        title: '最強',
        date: '20211206',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/rp-js8O2H7qqvEO3jED15ySET3n2i1LErhnh_W9-ib2HU5FhV0RldCWmdVeGmY7gQqgdyCmPRDBRE4n0fyoBOg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1jMJgeaDMqXKL',
        started_at: 1639191468836,
        title: 'ひる',
        date: '20211211',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/20US8zupTRtsOrkrVXo3KfsejS5kN1Shvti0phECAutEQRkO3ebw3IIGXOd4-0bMcE2sZRbwFfbW-K12fLjkCQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1gqGvlPRzvBxB',
        started_at: 1639319158290,
        title: '会話',
        date: '20211212',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/9qoGUIzPGm2tL5WTyiU0EsKBxukQ8eSwMCfIg6FrxsVXoeWlUjdUzTO6phOQqCak8T7dFkR7yiuBj15_cDbF0A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1yNGaYENVkgGj',
        started_at: 1639735308590,
        title: 'あ',
        date: '20211217',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/tnKNeEMVHUeNMzIR26JmU6YkL7wHYYw4d5DpPUN9pU5RnioXxk-rISqxR84CtoLWf0YI8tS6OAJkzWAbXNFY2Q/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1OyJADqBEgDGb',
        started_at: 1640347939944,
        title: 'かんぶとケーキ食う🎂',
        date: '20211224',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/xxXsUisv7lNh5890crHn4b_krX4IaeVfFLq2hgy_56RZn9oV2xO0LLyyxGll7KtkShk3z04Ehw__Gt0q3rcv9A/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1mnGedeXloNKX',
        started_at: 1640430793373,
        title: 'いろは来る',
        date: '20211225',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/5zPFPFIAE_Qie2fLE_iV4j3LTnnW5CePc3vB69SHgesg8YLwsPsENmsNgjaYX9eLc3ss5NrnoRoaNJW3N7oFFg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'LaplusDarknesss',
        id: '1YpKkZMzboZxj',
        started_at: 1640613750321,
        title: '少々はなす',
        date: '20211227',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/46BI0C11jDZG_0hPBxZkkFj5-9A5FjC3Hq7mluvPu2a1ZiQHXgwPTBGKz_3LG43e3iZemvOLRKcMrG_6tpy4bg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'takanelui',
        id: '1yNxaYMROmrxj',
        started_at: 1640173025662,
        title: '今日はまったりと過ごす日。マリカ頑張る。#ルイルイスペース',
        date: '20211222',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/VMFe9C1_wuuXvTcGGlfn3RkeNMvKgZ8Djre8KMo-z-3ppvyUE7t82qlBf-G3Ri-1ykM7-oDjoSsFzbIcFd10Hw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'hakuikoyori',
        id: '1gqGvlPzXXgxB',
        started_at: 1639132525053,
        title: 'アンガスビーフグラコロとビーフシチューパイ食べる！',
        date: '20211210',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/LRNKyxAoCNNxLxeIBvVS54owSY-bNthQX4Ewd6goE54BBEjrEx2MTS14wWfUI12bNoIhjpzgfCNLy69ZjApkBQ/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'kazamairohach',
        id: '1dRKZlvYPvNJB',
        started_at: 1639806494457,
        title: 'いろは、はじめてのデリバリー',
        date: '20211218',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/Lu1_xvbU6-ELDSrXqZPVvgxioAFV4FOFfuLLtZr6bsWXSjMFxb3x7tJOgUrIX-ItNeLjD7O495_9klJgeEh57w/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kazamairohach',
        id: '1gqxvlWPEPeGB',
        started_at: 1640056604628,
        title: 'こんにちはお昼ごはん🍙#いろはスペース',
        date: '20211221',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/iXtRkeDvPBqKivnxjGMmu4h3VeGUInNbvCdPARMwI06nBrvvP0ObbhXd7tadhtux4v90BBKYTQnNrUalXWWzrA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kazamairohach',
        id: '1mrxmajmblLxy',
        started_at: 1640357142296,
        title: 'めりーくるしみますぺーす🎄',
        date: '20211224',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/mBLHS9xDKh2nm6Itw_OtlTlFI5vDHgSstFbRswvsdTVVdBRWlv9T9EKgs0SfMBWFc0038kf-wLn_iHdRa0hOFA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kazamairohach',
        id: '1dRKZlybYrVJB',
        started_at: 1640399410586,
        title: '寝過ぎました。懺悔の寝起きスペース5分',
        date: '20211225',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/wRq_LBAtONi3krMzJiyHCZBWWMf9ZoeHicGTgYh0uDLHzRWvXJxSrHAg-9BjHjuFBwx99cztTcHDCS6-15lcqg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'hakosbaelz',
        id: '1RDxlgXWgNOJL',
        started_at: 1636032915035,
        title: '#SUIKASPACE',
        date: '20211104',
        playlist_url: 'https://prod-fastly-ap-southeast-2.video.pscp.tv/Transcoding/v1/hls/XKnBBoWji-hF8nrbD5vQ7h-31NUjVvX28REcW9rnLbuj_JWxZ43w1b3nu9CZ1GRIp1fWlTTZw_OwBmKtQOHhYg/non_transcode/ap-southeast-2/periscope-replay-direct-prod-ap-southeast-2-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'hakosbaelz',
        id: '1YqGopBYrLkJv',
        started_at: 1640875916245,
        title: 'I can’t sleep so #SUIKASPACE',
        date: '20211230_1',
        playlist_url: 'https://prod-fastly-ap-southeast-2.video.pscp.tv/Transcoding/v1/hls/zmkM87MXYKQSaKfNxTAlLVGW29jVzQIhNQE-n9i9rl9GvNjAgoKRNOrZyZCArNxqzy9uPmMuKqn90K538mdcEA/non_transcode/ap-southeast-2/periscope-replay-direct-prod-ap-southeast-2-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'hakosbaelz',
        id: '1LyxBoZPLjoKN',
        started_at: 1640876770561,
        title: 'I can’t sleep so #SUIKASPACE',
        date: '20211230_2',
        playlist_url: 'https://prod-fastly-ap-southeast-2.video.pscp.tv/Transcoding/v1/hls/bQDWpejD2AsjS7TEqLlcfybpHS5RgA5a23qTOczSRjrZFMNm8UalVZL2EKywQJKNzBuRQ7YwwM5nn1-LA7PpKg/non_transcode/ap-southeast-2/periscope-replay-direct-prod-ap-southeast-2-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'moonahoshinova',
        id: '1MYxNnWjaEVxw',
        started_at: 1635955872915,
        title: '#MOOLIESPACE',
        date: '20211103',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/b9oz0_bamK7oa1n8foC4POKDTw-ao7AnFrdwQ6MmKhmOClM28SpaOkyOitUy9zg3QRL46lVR5VpHuwCan1BX5Q/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'moonahoshinova',
        id: '1PlJQaBobDVJE',
        started_at: 1636623290730,
        title: '#MoonAspace',
        date: '20211111',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/IsgBRR3JklebFRJOZy8LO81wsXtTGnMic73I2RQGU0oSOIsPp7QRi3ZY7VGufgaZ9gTHoOT-XRBQWn0HZrzf9g/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'moonahoshinova',
        id: '1jMKgejEVzlJL',
        started_at: 1636904477876,
        title: '#Moona_Spacetime',
        date: '20211114',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/RBEu64KaFMUyXrJJfgSBAwi4ifvicbr-RQvtNeCi1prqURRTftebL79h_m7dw2rDZ90uOc9fZNou2z2w8td0tw/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'airaniiofifteen',
        id: '1BdxYwamaEBGX',
        started_at: 1634866258574,
        title: 'PAGI ! ❤️',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/vkHJC51zjbGR4zAAcgLjc78DazolVJIP8pDwoG1Pn9KuHSzMWOfsartAGNveyc55QMaRkNayDuV7KfgjHHEwSQ/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'airaniiofifteen',
        id: '1mnxedqYQebJX',
        started_at: 1635817892526,
        title: 'Pagi 😴',
        date: '20211102',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/RjenByFUy836qieOjXxhLiIdKbUczC0A71l2Jy7IRpd4e1EEyEHpuIvwo1RyyXCMvysY9YfS0Yv3HnCoaRoXvg/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'airaniiofifteen',
        id: '1YqKDqYRjbVGV',
        started_at: 1637674884096,
        title: 'Malam….. #ioLyfe',
        date: '20211123',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/nDQD5z3VHzy7smZnlHz8YJndLldZAN2wD5k5xNTpwczvAmSNgMvfEc3tWJGxwapAAUwrkoRI55uJtQiq2H282Q/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'kureijiollie',
        id: '1kvJpANLoOZxE',
        started_at: 1634919500921,
        title: 'LATE NIGHT ZOMBIE TALK🧟‍♀️',
        date: '20211022',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/madmQbNh0QLQS8hCzj__8UOJqCxnT_3dVL33DpJkTAeWQ5w-EAElOPZTFNPEfuT9LMIae28NaBq9s_qqNO7cgA/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1vAxRkoNOwZKl',
        started_at: 1635952069082,
        title: '#KUREIJISPACE',
        date: '20211103',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/o_YunbTi-UwhaxwU2DSpLTSTafu432k96hdj-g-nnMqY5qKKZzoQ7vn1EKV7NcpcffrjNe-cL0eowNhISjKJlg/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1BdGYwzoXkXxX',
        started_at: 1637744514982,
        title: 'Technical Issues SUCK #kureijispace',
        date: '20211124',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/EjUIjFOQO49rqUicGhC5iWBkmwJeoZIRn6d9SGA8Ll5Kpg8hF6OgT2AhDfjNzNw7j4QNTknT7btB2Dn3C5HIZA/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1DXGyDPdRwkKM',
        started_at: 1637996376468,
        title: '#kureijispace',
        date: '20211127',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/WEDOnsYygN6gfLRVhVTEz6WHN5KhNtwxIhjy76uvKQoaLVe2gkIoQYKRdjX7X3WeR3D3nPpxMgXj24ybFXdREQ/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1OwxWzgNpPmJQ',
        started_at: 1638880213827,
        title: '🥳🥳 #kureijispace',
        date: '20211207',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/BfHmJK7-VgzKPq0Rv8cY9eQQLoAyRhHojjCXzxKCufxW8WF4u4Dfo1gmc_6VZ_Q4fMNHtNZaJnDqf7gBDa-auA/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1eaKbNZrqYRKX',
        started_at: 1639735230100,
        title: 'IM BACC (health update) #kureijispace',
        date: '20211217',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/1HsLTDQVoFv500Jtt_qQhzIZKtn8B2QccypcgeWMqQjudJ8soGFmbiIn7RFA_oeWvBb-3p39EIdU54RNao-LUw/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      {
        screen_name: 'kureijiollie',
        id: '1eaJbNyVbkYJX',
        started_at: 1640436283572,
        title: 'SHORT SPACE #kureijispace',
        date: '20211225',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/xwDQHk-kK7LFSwFhCayR_qxYu25zYxb4sYr70eKkRg6ze-zrwTaYS4EKy0suEpDjM9kamfebin522ENp0_84hw/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'pavoliareine',
        id: '1lPKqmakQYPKb',
        started_at: 1636017246669,
        title: '#HOLOROSPACE',
        date: '20211104',
        playlist_url: 'https://prod-fastly-ap-southeast-1.video.pscp.tv/Transcoding/v1/hls/49PfV30L-orBeTtAsxdDwfvOFbQOTYHzBx61H2IiGOcUD48m13XKF1PF4-h04vbxbR60LdFRnZjXrElnJgwQ9Q/non_transcode/ap-southeast-1/periscope-replay-direct-prod-ap-southeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
      {
        screen_name: 'ui_shig',
        id: '1eaKbNEWyEBKX',
        started_at: 1635430804987,
        title: 'ういの宇宙',
        date: '20211028',
        playlist_url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/LziQqBSwZ_Bd0ru6N1WwabkK0hun-zUCcWpNx1q2CvygFu-KAziR7649NUq1_eYxDMqOzrAMSsdgxREgvc8ijw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
      },
      // ================================================================================
      // ================================================================================
    ]

    const filteredSpaces = spaces
      .filter((v) => v.playlist_url)
    // .filter((v) => v.id === '1yoJMWvbybNKQ')

    filteredSpaces.forEach((space) => {
      const user = users.find((v) => v.screen_name === space.screen_name)
      let { date } = space
      if (space.started_at) {
        date = new Date(space.started_at)
          .toISOString()
          .replace(/[^\d]/g, '')
          .substring(0, 8)
      }
      const name = `[${space.screen_name}][${date}] ${space.title || 'NA'} (${space.id})`
      const metadata = {
        title: space.title,
        author: user.name,
        artist: user.name,
        episode_id: space.id,
      }
      new SpaceDownloader(
        space.playlist_url,
        name,
        space.screen_name,
        metadata,
      ).download()
    })
  })

export { command as testCommand }
