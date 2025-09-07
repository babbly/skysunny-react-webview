import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ 토큰 저장소
import Axios from 'axios';
import { Alert } from 'react-native';
import util from 'util';
import Const from '../const';

const makeUrl = (url, params) => {
    let result = "https://skysunny-api.mayoube.co.kr" + url;
    if (params != null) params.forEach(param => {
        result = util.format(result, param);
    });
    console.log('url: ' + result);
    return result;
};

const loadingStart = () => {
    global.loadingCount++;
    if (global.loadingCount == 1) {
        this.dlg.show();
    }
};

const loadingEnd = async () => {
    try {
        if (global.loadingCount <= 1) {
            this.dlg.dismiss();
        }
    } catch (e) { }
    global.loadingCount--;
};

// ✅ 매 요청마다 토큰 불러와서 config 만들어주는 함수
const getRequestConfig = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return {
        withCredentials: true,
        headers: {
            Accept: 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8',
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // ✅ 토큰 있으면 추가
        },
    };
};

const httpGet = async (url, params, data, hideLoading) => {
    console.log("++++++++++++++httpGet=" + url, params);
    if (!hideLoading) loadingStart();

    try {
        const config = await getRequestConfig();
        const response = await Axios.get(makeUrl(url, params), {
            ...config,
            params: data || {}
        });
        if (!hideLoading) loadingEnd();
        return response.data;
    } catch (error) {
        if (!hideLoading) loadingEnd();
        return errorReject(hideLoading, null, url)(error);
    }
};

const httpPost = async (url, params, data, hideLoading) => {
    console.log('data: ' + JSON.stringify(data));
    if (!hideLoading) loadingStart();

    try {
        const config = await getRequestConfig();
        const response = await Axios.post(makeUrl(url, params), data, config);
        if (!hideLoading) loadingEnd();
        return response.data;
    } catch (error) {
        if (!hideLoading) loadingEnd();
        return errorReject(hideLoading, null, url)(error);
    }
};

const httpPut = async (url, params, data, hideLoading) => {
    console.log("++++++++++++++httpPut=" + url);
    if (!hideLoading) loadingStart();

    try {
        const config = await getRequestConfig();
        const response = await Axios.put(makeUrl(url, params), data, config);
        if (!hideLoading) loadingEnd();
        return response.data;
    } catch (error) {
        if (!hideLoading) loadingEnd();
        return errorReject(hideLoading, null, url)(error);
    }
};

const imageUrl = (idx) => {
    return (
        Const.serverProtocol +
        '://' +
        Const.serverIp +
        ':' +
        Const.serverPort +
        Const.serverContext +
        '/file/' +
        idx
    );
};

const serverUrl =
    Const.serverProtocol +
    '://' +
    Const.serverIp +
    ':' +
    Const.serverPort +
    Const.serverContext;

const httpUrl = {
    qrCode: '/user/qr-code/%s',

};

export {
    httpGet,
    httpPost,
    httpPut,
    httpUrl,
    imageUrl,
    serverUrl
};

function errorReject(hideLoading, reject, url) {
    return error => {
        console.log('## http error: ' + url + " - " + JSON.stringify(error, null, 4));
        if (error?.response?.status === 401) {
            Alert.alert("장기간 미사용하여 자동 로그아웃 되었습니다! 다시 로그인해주세요.");
        } else {
            Alert.alert(
                "서버 요청 오류",
                `서버 요청 중 오류가 발생했습니다. [ ${url} ]`
            );
        }
        if (reject) reject(error);
        throw error; // 호출한 쪽에서도 잡을 수 있게 던짐
    };
}
