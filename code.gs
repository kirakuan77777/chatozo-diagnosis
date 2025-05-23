// === 各スプレッドシートのIDをここに設定 ===
const SHEET_ID_FIRST = '1e7LZLP9qCz32JzfdAFvwPTys-cpSAlwhB277pcxg8Cs';
const SHEET_ID_SECOND = '1eVKuV5z1vqz7vd8MCj5_zKUI-P5glcxrpxHWWGd14AI';
const SHEET_ID_RECORD = '1BR2aVxllnrpbllC7RNPXPD2wxQxoQFKhEOzUoVIj-EM';

// === GET：質問データを取得（前半 or 後半）===
function doGet(e) {
  try {
    const type = e.parameter.type || 'first';
    let ss;

    if (type === 'first') {
      ss = SpreadsheetApp.openById(SHEET_ID_FIRST);
    } else if (type === 'second') {
      ss = SpreadsheetApp.openById(SHEET_ID_SECOND);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'ERROR',
        message: 'Invalid type parameter' 
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const questions = [];

    for (let i = 1; i < data.length; i++) {
      if (!data[i][1]) continue; // 空の行をスキップ
      
      questions.push({
        text: data[i][1],     // 質問文
        choiceA: data[i][2] || '',      // A選択肢
        choiceB: data[i][4] || '',      // B選択肢
        choiceC: data[i][6] || ''       // C選択肢
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'OK',
      questions: questions 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'ERROR',
      message: err.message 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// === POST：回答を保存 ===
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { userId, qNum, answer } = data;

    if (!userId || !qNum || !answer) {
      throw new Error('必要なパラメータが不足しています');
    }

    const ss = SpreadsheetApp.openById(SHEET_ID_RECORD);
    const sheet = ss.getSheetByName('ユーザ記録');

    if (!sheet) {
      throw new Error('シート「ユーザ記録」が見つかりません');
    }

    const records = sheet.getDataRange().getValues();
    let userRow = -1;

    for (let i = 1; i < records.length; i++) {
      if (records[i][0] == userId) {
        userRow = i + 1;
        break;
      }
    }

    if (userRow === -1) {
      userRow = sheet.getLastRow() + 1;
      sheet.getRange(userRow, 1).setValue(userId);
    }

    // 回答をB列(2)から順に記録
    sheet.getRange(userRow, qNum + 2).setValue(answer);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'OK',
      message: '回答を保存しました' 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'ERROR',
      message: err.message 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}
