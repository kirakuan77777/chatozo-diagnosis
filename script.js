const SPREADSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbz2X37n6Pvsk7i8QRYN1FJ9t1S-T5bZpI2QzLbd3FTdL2b8S5-bxTe6KKmylp2G6j7Zeg/exec';
const USER_ID = 'user001'; // 実際にはランダムIDやLINE IDなどに置き換え

let questions = [];
let currentIndex = 0;

window.onload = async () => {
  await loadQuestions();
  showQuestion();
};

async function loadQuestions() {
  const res = await fetch(`${SPREADSHEET_API_URL}?mode=getQuestions&type=first`);
  const data = await res.json();
  questions = data.questions;
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
  const qNum = currentIndex + 1;

  await fetch(SPREADSHEET_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      mode: 'recordAnswer',
      userId: USER_ID,
      qNum: qNum,
      answer: answer
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  currentIndex++;
  showQuestion();
}
