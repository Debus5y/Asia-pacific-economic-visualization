import { dataCodes } from "../data/dataCodes"

//const errorMessageObj = { error: 'Data Unavailable' }

/**
 * Given a country code aggregate data by it's economic data codes
 * 
 * @param {*} countryCode this is a singular country code in a string
 * @param {*} args this is an array of of data codes as strings
 * @returns { 'US': {'GDP': <dataObject>, ...}}
 */
import * as d3 from 'd3';

export const fetchData = async (countryCode, args = dataCodes) => {
    const singleCountryData = {};
    singleCountryData[countryCode] = {};

    // 读取本地 GDP.csv 文件
    const data = await d3.csv('path/to/GDP.csv');

    // 遍历数据找到匹配的国家
    const countryData = data.find(row => row['Country Code'] === countryCode);

    if (countryData) {
        // 提取所有年份的数据
        const clean = {};
        for (const year in countryData) {
            if (year.match(/^\d{4}$/)) {
                clean[year] = parseFloat(countryData[year]) || null;
            }
        }

        // 检查数据是否有效
        singleCountryData[countryCode] = checkData(clean) ? clean : errorMessageObj;
    } else {
        singleCountryData[countryCode] = errorMessageObj;
    }

    return singleCountryData;
}

// 假设 checkData 和 cleanData 是自定义的函数，你需要根据具体需求实现它们
function checkData(data) {
    // 实现数据检查逻辑
    return Object.values(data).some(value => value !== null);
}

function cleanData(data, countryCode) {
    // 实现数据清理逻辑
    return data;
}

// export const fetchData = async (countryCode, args = dataCodes) => {
//     const singleCountryData = {}
//     singleCountryData[countryCode] = {}
//     for(const code of args){
//         const data = await fetch(`https://www.econdb.com/api/series/${code}${countryCode}/?format=json`)
//         if (data.ok){
//             const dataAsJson = await data.json()
//             const clean = cleanData(dataAsJson, countryCode)
//             checkData(dataAsJson) ? 
//                 singleCountryData[countryCode] = clean : 
//                 singleCountryData[countryCode] = errorMessageObj
//         } else {
//             singleCountryData[countryCode] = errorMessageObj
//         }
//     }
//     return singleCountryData
// }


/**
 * Checks that data returned by api fetch is available and populated
 * This deals with an edge case where the http query returns a status code of 200,
 * but the data is not populated
 * 
 * @param {*} dataAsJson 
 * @returns boolean
 */
const checkData = (dataAsJson) => {
    const { data } = dataAsJson
    return data.dates.length && data.values.length && data.status.length 
} 

const cleanData = (dataAsJson, country) => {
    const data = {}
    let dates = dataAsJson.data.dates,
        values = dataAsJson.data.values;
        if (country !== undefined){
            let c = country.toString();
            for (let i = 0; i < dates.length; i++){
                let strYear = parseInt(dates[i].slice(0, 4)),
                    strMonth = parseInt(dates[i].slice(5, 7)),
                    year = parseInt(strYear),
                    month = parseInt(strMonth),
                    val = parseInt(values[i]); 
                if (c === 'CN') {
                    val = val * 10000  
                } else if (val < 1000000 && (country.toString() !== 'LU' && country.toString() !== 'MO' && country.toString() !== 'NP' )){
                    val = val * 1000 
                }     
                if ( month === 1 ){
                    data[year] = val
                }
            }
        }
    return data
}