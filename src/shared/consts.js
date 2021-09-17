
export const CAP1_URL = process.env.REACT_APP_CAP1_URL;
export const CAP2_URL = process.env.REACT_APP_CAP2_URL;
export const GEO_IP_INFO = process.env.REACT_APP_GEO_IP_INFO;
export const DANTE_IN_IP = process.env.REACT_APP_DANTE_IN_IP;
export const JSRP_STATE = process.env.REACT_APP_JSRP_STATE;
export const JSDB_STATE = process.env.REACT_APP_JSDB_STATE;
export const STUN_SRV_STR = process.env.REACT_APP_STUN_SRV_STR;
export const STUN_SRV_GXY = process.env.REACT_APP_STUN_SRV_GXY;
export const STUN_SRV_MKZ = process.env.REACT_APP_STUN_SRV_MKZ;
export const ADMIN_SECRET = process.env.REACT_APP_ADMIN_SECRET;
export const SECRET = process.env.REACT_APP_SECRET;
export const JANUS_SRV_VRT = process.env.REACT_APP_JANUS_SRV_VRT;
export const JANUS_SRV_GXY = process.env.REACT_APP_JANUS_SRV_GXY;
export const JANUS_ADMIN_VRT = process.env.REACT_APP_ADMIN_SRV_VRT;
export const JANUS_ADMIN_GXY = process.env.REACT_APP_ADMIN_SRV_GXY;
export const JANUS_STR_SRV1 = process.env.REACT_APP_JANUS_STR_SRV1;
export const JANUS_STR_SRV2 = process.env.REACT_APP_JANUS_STR_SRV2;
export const JANUS_STR_SRV3 = process.env.REACT_APP_JANUS_STR_SRV3;
export const JANUS_STR_SRV4 = process.env.REACT_APP_JANUS_STR_SRV4;
export const JANUS_STR_SRV5 = process.env.REACT_APP_JANUS_STR_SRV5;
export const JANUS_STR_SRV6 = process.env.REACT_APP_JANUS_STR_SRV6;
export const JANUS_STR_SRV7 = process.env.REACT_APP_JANUS_STR_SRV7;
export const JANUS_STR_SRV8 = process.env.REACT_APP_JANUS_STR_SRV8;
export const JANUS_STR_SRV9 = process.env.REACT_APP_JANUS_STR_SRV9;
export const JANUS_STR_SRV10 = process.env.REACT_APP_JANUS_STR_SRV10;
export const JANUS_STR_SRV11 = process.env.REACT_APP_JANUS_STR_SRV11;
export const JANUS_STR_SRV12 = process.env.REACT_APP_JANUS_STR_SRV12;
export const JANUS_STR_SRV_BB = process.env.REACT_APP_JANUS_STR_SRV_BB;
export const JANUS_IP_ISRPT = process.env.REACT_APP_JANUS_IP_ISRPT;
export const JANUS_IP_EURND = process.env.REACT_APP_JANUS_IP_EURND;
export const JANUS_IP_EURUK = process.env.REACT_APP_JANUS_IP_EURUK;
export const JANUS_IP_EURFR = process.env.REACT_APP_JANUS_IP_EURFR;
export const ENC_URL = process.env.REACT_APP_ENC_URL;
export const JNS_SRV = process.env.REACT_APP_JNS_SRV
export const JANUS_SRV_EURFR = "https://stream.kli.one/janustrl";


export const servers_options = [
    { key: 0, text: 'Test', value: `https://gxydev.kli.one/janusgxy` },
    { key: 1, text: 'Str1', value: `${JANUS_STR_SRV1}` },
    { key: 2, text: 'Str2', value: `${JANUS_STR_SRV2}` },
    { key: 3, text: 'Str3', value: `${JANUS_STR_SRV3}` },
    { key: 4, text: 'Str4', value: `${JANUS_STR_SRV4}` },
    { key: 5, text: 'Str5', value: `${JANUS_STR_SRV5}` },
    { key: 6, text: 'Str6', value: `${JANUS_STR_SRV6}` },
    { key: 7, text: 'Str7', value: `${JANUS_STR_SRV7}` },
    { key: 8, text: 'Str8', value: `${JANUS_STR_SRV8}` },
    { key: 9, text: 'Str9', value: `${JANUS_STR_SRV9}` },
    { key: 10, text: 'Mcast', value: `https://str11.kli.one/janusgxy` },
    // { key: 10, text: 'Str10', value: `${JANUS_STR_SRV10}` },
    // { key: 11, text: 'Str11', value: `${JANUS_STR_SRV11}` },
    // { key: 12, text: 'Str12', value: `${JANUS_STR_SRV12}` },
    { key: 13, text: 'Mkz', value: `${JANUS_STR_SRV_BB}` },
];

export const videos_options = [
    { key: 1, text: '240p', value: 11 },
    { key: 2, text: '360p', value: 1 },
    { key: 3, text: '720p', value: 16 },
    { key: 4, text: 'NoVideo', value: 3 },
];

export const admin_videos_options = [
    { key: 1, text: '240p', value: 11 },
    { key: 2, text: '360p', value: 1 },
    // { key: 3, text: '480p', value: 66 },
    { key: 4, text: '720p', value: 16 },
    // { key: 5, text: 'RTCP', value: 103 },
    //{ key: 6, text: 'NoVideo', value: 4 },
];

export const audios_options = [
    { key: 100, value: 100, text: 'Source', disabled: true, icon: "tags" },
    { key: 'he', value: 15, flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: 23, flag: 'ru', text: 'Russian' },
    { key: 'en', value: 24, flag: 'us', text: 'English' },
    { key: 'es', value: 26, flag: 'es', text: 'Spanish' },
    { key: 'fr', value: 25, flag: 'fr', text: 'French' },
    { key: 'it', value: 28, flag: 'it', text: 'Italian' },
    { key: 'de', value: 27, flag: 'de', text: 'German' },
    { key: 'tr', value: 42, flag: 'tr', text: 'Turkish' },
    { key: 'pt', value: 41, flag: 'pt', text: 'Portuguese' },
    { key: 'bg', value: 43, flag: 'bg', text: 'Bulgarian' },
    { key: 'ka', value: 44, flag: 'ge', text: 'Georgian' },
    { key: 'ro', value: 45, flag: 'ro', text: 'Romanian' },
    { key: 'hu', value: 46, flag: 'hu', text: 'Hungarian' },
    { key: 'sv', value: 47, flag: 'se', text: 'Swedish' },
    { key: 'lt', value: 48, flag: 'lt', text: 'Lithuanian' },
    { key: 'hr', value: 49, flag: 'hr', text: 'Croatian' },
    { key: 'ja', value: 50, flag: 'jp', text: 'Japanese' },
    { key: 'sl', value: 51, flag: 'si', text: 'Slovenian' },
    { key: 'pl', value: 52, flag: 'pl', text: 'Polish' },
    { key: 'no', value: 53, flag: 'no', text: 'Norwegian' },
    { key: 'lv', value: 54, flag: 'lv', text: 'Latvian' },
    { key: 'ua', value: 55, flag: 'ua', text: 'Ukrainian' },
    { key: 'nl', value: 56, flag: 'nl', text: 'Dutch' },
    { key: 'cn', value: 57, flag: 'cn', text: 'Chinese' },
    { key: 'et', value: 58, flag: 'et', text: 'Amharic' },
    { key: 'in', value: 59, flag: 'in', text: 'Hindi' },
    { key: 'ir', value: 60, flag: 'ir', text: 'Persian' },
    { key: 101, value: 101, text: 'Workshop', disabled: true, icon: "tags"},
    { key: 2, value: 2, flag: 'il', text: 'Hebrew' },
    { key: 3, value: 3, flag: 'ru', text: 'Russian' },
    { key: 4, value: 4, flag: 'us', text: 'English' },
    { key: 6, value: 6, flag: 'es', text: 'Spanish' },
    { key: 5, value: 5, flag: 'fr', text: 'French' },
    { key: 8, value: 8, flag: 'it', text: 'Italian' },
    { key: 7, value: 7, flag: 'de', text: 'German' },
    { key: 102, value: 102, text: 'Special', disabled: true, icon: "tags" },
    { key: 10, value: 10, text: 'Heb - Rus' },
    { key: 17, value: 17, text: 'Heb - Eng' },
    { key: 201, value: 201, text: 'Galaxy1' },
    { key: 203, value: 203, text: 'Galaxy2' },
    { key: 202, value: 202, text: 'Galaxy4' },
    { key: 204, value: 204, text: 'Galaxy5' },
];

export const dual_languages = [
    { key: 'he', value: "heb", flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: "rus", flag: 'ru', text: 'Russian' },
    { key: 'en', value: "eng", flag: 'us', text: 'English' },
    { key: 'es', value: "spa", flag: 'es', text: 'Spanish' },
    { key: 'fr', value: "fre", flag: 'fr', text: 'French' },
    { key: 'it', value: "ita", flag: 'it', text: 'Italian' },
    { key: 'de', value: "ger", flag: 'de', text: 'German' },
    { key: 'tr', value: "trk", flag: 'tr', text: 'Turkish' },
    { key: 'pt', value: "por", flag: 'pt', text: 'Portuguese' },
    { key: 'bg', value: "bul", flag: 'bg', text: 'Bulgarian' },
    { key: 'ka', value: "geo", flag: 'ge', text: 'Georgian' },
    { key: 'ro', value: "rom", flag: 'ro', text: 'Romanian' },
    { key: 'hu', value: "hun", flag: 'hu', text: 'Hungarian' },
    { key: 'sv', value: "swe", flag: 'se', text: 'Swedish' },
    { key: 'lt', value: "lit", flag: 'lt', text: 'Lithuanian' },
    { key: 'hr', value: "cro", flag: 'hr', text: 'Croatian' },
    { key: 'ja', value: "jpn", flag: 'jp', text: 'Japanese' },
    { key: 'sl', value: "slo", flag: 'si', text: 'Slovenian' },
    { key: 'pl', value: "pol", flag: 'pl', text: 'Polish' },
    { key: 'no', value: "nor", flag: 'no', text: 'Norwegian' },
    { key: 'lv', value: "lat", flag: 'lv', text: 'Latvian' },
    { key: 'ua', value: "ukr", flag: 'ua', text: 'Ukrainian' },
    { key: 'nl', value: "dut", flag: 'nl', text: 'Dutch' },
    { key: 'cn', value: "chn", flag: 'cn', text: 'Chinese' },
    { key: 'et', value: "amn", flag: 'et', text: 'Amharic' },
    { key: 'in', value: "hin", flag: 'in', text: 'Hindi' },
    { key: 'ir', value: "per", flag: 'ir', text: 'Persian' },
];

export const audio_options = [
    { key: 101, value: 101, text: '', disabled: true, label: "Workshop"},
    { key: 2, value: 2, text: 'Hebrew' },
    { key: 3, value: 3, text: 'Russian' },
    { key: 4, value: 4, text: 'English' },
    { key: 6, value: 6, text: 'Spanish' },
    { key: 5, value: 5, text: 'French' },
    { key: 8, value: 8, text: 'Italian' },
    { key: 7, value: 7, text: 'German' },
    { key: 102, value: 102, text: '', disabled: true, label: "Sources" },
    { key: 'he', value: 15, text: 'Hebrew' },
    { key: 'ru', value: 23, text: 'Russian' },
    { key: 'en', value: 24, text: 'English' },
    { key: 'es', value: 26, text: 'Spanish' },
    { key: 'fr', value: 25, text: 'French' },
    { key: 'it', value: 28, text: 'Italian' },
    { key: 'de', value: 27, text: 'German' },
    { key: 'tr', value: 42, text: 'Turkish' },
    { key: 'pt', value: 41, text: 'Portuguese' },
    { key: 'bg', value: 43, text: 'Bulgarian' },
    { key: 'ka', value: 44, text: 'Georgian' },
    { key: 'ro', value: 45, text: 'Romanian' },
    { key: 'hu', value: 46, text: 'Hungarian' },
    { key: 'sv', value: 47, text: 'Swedish' },
    { key: 'lt', value: 48, text: 'Lithuanian' },
    { key: 'hr', value: 49, text: 'Croatian' },
    { key: 'ja', value: 50, text: 'Japanese' },
    { key: 'sl', value: 51, text: 'Slovenian' },
    { key: 'pl', value: 52, text: 'Polish' },
    { key: 'no', value: 53, text: 'Norwegian' },
    { key: 'lv', value: 54, text: 'Latvian' },
    { key: 'ua', value: 55, text: 'Ukrainian' },
    { key: 'nl', value: 56, text: 'Dutch' },
    { key: 'cn', value: 57, text: 'Chinese' },
    { key: 'et', value: 58, text: 'Amharic' },
    { key: 'in', value: 59, text: 'Hindi' },
    { key: 'ir', value: 60, text: 'Persian' },
    { key: 103, value: 103, text: '', disabled: true, label: "Special"},
    { key: 10, value: 10, text: 'Heb - Rus' },
    { key: 17, value: 17, text: 'Heb - Eng' },
    { key: 'gxy5', value: 204, text: 'Galaxy' },
    { key: 104, value: 104, text: '', disabled: true, label: "Trl"},
    { key: 301, value: 301, flag: 'il', text: 'Hebrew' },
    { key: 302, value: 302, flag: 'ru', text: 'Russian' },
    { key: 303, value: 303, flag: 'us', text: 'English' },
    { key: 304, value: 304, flag: 'es', text: 'Spanish' },
    { key: 305, value: 305, flag: 'fr', text: 'French' },
    { key: 306, value: 306, flag: 'it', text: 'Italian' },
    { key: 307, value: 307, flag: 'de', text: 'German' },
];

export const ulpan1_audio_options = [
    { key: 'he', value: 512, text: 'Hebrew' },
    { key: 'ru', value: 513, text: 'Russian' },
];

export const ulpan2_audio_options = [
    { key: 'he', value: 522, text: 'Hebrew' },
    { key: 'ru', value: 523, text: 'Russian' },
];

export const audiog_options = [
    { key: 101, value: 101, text: 'Workshop', disabled: true, icon: "tags", selected: true},
    { key: 2, value: 2, flag: 'il', text: 'Hebrew' },
    { key: 3, value: 3, flag: 'ru', text: 'Russian' },
    { key: 4, value: 4, flag: 'us', text: 'English' },
    { key: 6, value: 6, flag: 'es', text: 'Spanish' },
    { key: 5, value: 5, flag: 'fr', text: 'French' },
    { key: 8, value: 8, flag: 'it', text: 'Italian' },
    { key: 7, value: 7, flag: 'de', text: 'German' },
    { key: 100, value: 100, text: 'Source', disabled: true, icon: "tags", selected: true},
    { key: 'he', value: 15, flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: 23, flag: 'ru', text: 'Russian' },
    { key: 'en', value: 24, flag: 'us', text: 'English' },
    { key: 'es', value: 26, flag: 'es', text: 'Spanish' },
    { key: 'fr', value: 25, flag: 'fr', text: 'French' },
    { key: 'it', value: 28, flag: 'it', text: 'Italian' },
    { key: 'de', value: 27, flag: 'de', text: 'German' },
    { key: 'tr', value: 42, flag: 'tr', text: 'Turkish' },
    { key: 'pt', value: 41, flag: 'pt', text: 'Portuguese' },
    { key: 'bg', value: 43, flag: 'bg', text: 'Bulgarian' },
    { key: 'ka', value: 44, flag: 'ge', text: 'Georgian' },
    { key: 'ro', value: 45, flag: 'ro', text: 'Romanian' },
    { key: 'hu', value: 46, flag: 'hu', text: 'Hungarian' },
    { key: 'sv', value: 47, flag: 'se', text: 'Swedish' },
    { key: 'lt', value: 48, flag: 'lt', text: 'Lithuanian' },
    { key: 'hr', value: 49, flag: 'hr', text: 'Croatian' },
    { key: 'ja', value: 50, flag: 'jp', text: 'Japanese' },
    { key: 'sl', value: 51, flag: 'si', text: 'Slovenian' },
    { key: 'pl', value: 52, flag: 'pl', text: 'Polish' },
    { key: 'no', value: 53, flag: 'no', text: 'Norwegian' },
    { key: 'lv', value: 54, flag: 'lv', text: 'Latvian' },
    { key: 'ua', value: 55, flag: 'ua', text: 'Ukrainian' },
    { key: 'nl', value: 56, flag: 'nl', text: 'Dutch' },
    { key: 'cn', value: 57, flag: 'cn', text: 'Chinese' },
    { key: 99, value: 99, text: 'Special', disabled: true, icon: "tags", selected: true},
    { key: 'heru', value: 10, text: 'Heb-Rus' },
    { key: 'heen', value: 17, text: 'Heb-Eng' },
    { key: 'gxy1', value: 201, text: 'Galaxy1' },
    { key: 'gxy2', value: 202, text: 'Galaxy4' },
    { key: 'gxy3', value: 203, text: 'Galaxy2' },
    { key: 'gxy5', value: 204, text: 'Galaxy5' },
];

export const gxycol = [0, 201, 203, 202, 204];

export const trllang = {
        "Hebrew": 301,
        "Russian": 302,
        "English": 303,
        "French": 305,
        "Spanish": 304,
        "German": 307,
        "Italian": 306
};
