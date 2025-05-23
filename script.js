const SPREADSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbweirbWkxZ4vcqwfK0Nm8hvbPP6aEyoNuf7oIfRDSw5kvwS_zW-PWHtYHXnMPEtMx3Tww/exec';
const USER_ID = 'user001'; // 実際にはランダムIDやLINE IDなどに置き換え

let questions = [];
let currentIndex = 0;

window.onload = async () => {
  try {
    await loadQuestions();
    showQuestion();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    document.getElementById("question-text").innerText = "エラーが発生しました。ページを更新してください。";
  }
};

async function loadQuestions() {
  try {
    const res = await fetch(`${SPREADSHEET_API_URL}?type=first`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    questions = data.questions;
  } catch (error) {
    console.error('質問の読み込みに失敗しました:', error);
    throw error;
  }
}

function showQuestion() {
  if (currentIndex >= questions.length) {
    document.getElementById("question-text").innerText = "診断が完了しました！";
    document.getElementById("choices").style.display = "none";
    return;
  }

  const q = questions[currentIndex];
  document.getElementById("question-text").innerText = q.text;
  document.getElementById("choiceA").innerText = q.choiceA;
  document.getElementById("choiceB").innerText = q.choiceB;
  document.getElementById("choiceC").innerText = q.choiceC;

  document.getElementById("choiceA").onclick = () => submitAnswer("A");
  document.getElementById("choiceB").onclick = () => submitAnswer("B");
  document.getElementById("choiceC").onclick = () => submitAnswer("C");
}

async function submitAnswer(answer) {
  try {
    const qNum = currentIndex + 1;
    const response = await fetch(SPREADSHEET_API_URL, {
      method: 'POST',
      body: JSON.stringify({
        userId: USER_ID,
        qNum: qNum,
        answer: answer
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.status !== 'OK') {
      throw new Error('回答の保存に失敗しました');
    }

    currentIndex++;
    showQuestion();
  } catch (error) {
    console.error('回答の送信に失敗しました:', error);
    alert('回答の送信に失敗しました。もう一度お試しください。');
  }
}
