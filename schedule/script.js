const addBtns = document.querySelectorAll(".add-btn:not(.solid)");
const saveItemBtns = document.querySelectorAll(".solid");
const addItemContainers = document.querySelectorAll(".add-container");
const addItems = document.querySelectorAll(".add-item");

// 아이템 리스트
const listColumns = document.querySelectorAll(".drag-item-list");
const backlogListEl = document.getElementById("backlog-list");
const progressListEl = document.getElementById("progress-list");
const completeListEl = document.getElementById("complete-list");
const onHoldListEl = document.getElementById("on-hold-list");

// 아이템
let updatedOnLoad = false;

// 초기화 배열
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

// 드레그 기능
let draggedItem;
let dragging = false;
let currentColumn;

// 가능하면 로컬 저장소에서 배열 가져오기, 아닐시 디폴트로 가져옴
function getSavedColumns() {
  if (localStorage.getItem("backlogItems")) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ["Release the course", "Sit back and relax"];
    progressListArray = ["Work on projects", "Listen to music"];
    completeListArray = ["Being cool", "Getting stuff done"];
    onHoldListArray = ["Being uncool"];
  }
}

// 로컬 배열 설정하기
function updateSavedColumns() {
  listArrays = [
    backlogListArray,
    progressListArray,
    completeListArray,
    onHoldListArray,
  ];
  const arrayNames = ["backlog", "progress", "complete", "onHold"];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(
      `${arrayName}Items`,
      JSON.stringify(listArrays[index])
    );
  });
}

// 빈 value들이 들어간 배열 거르기
function filterArray(array) {
  const filteredArray = array.filter((item) => item !== null);
  return filteredArray;
}

// 돔 리스트 만들기
function createItemEl(columnEl, column, item, index) {
  // 리스트 아이템
  const listEl = document.createElement("li");
  listEl.textContent = item;
  listEl.id = index;
  listEl.classList.add("drag-item");
  listEl.draggable = true;
  listEl.setAttribute("onfocusout", `updateItem(${index}, ${column})`);
  listEl.setAttribute("ondragstart", "drag(event)");
  listEl.contentEditable = true;
  // Append
  columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
  // 로컬 스토리지 한번 체크하기
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  // 해야 될 일 콜럼
  backlogListEl.textContent = "";
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogListEl, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);
  // 진행중인 일 콜럼
  progressListEl.textContent = "";
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressListEl, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);
  // 완료된 일 콜럼
  completeListEl.textContent = "";
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeListEl, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);
  // 보류중인 일 콜럼
  onHoldListEl.textContent = "";
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldListEl, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);
  // 한 번 이상 작동 안하게 로컬 스토리지 업데이트
  updatedOnLoad = true;
  updateSavedColumns();
}

// 아이템 업데이트(필요시 삭제 또는  배열 value 업데이트)
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  const selectedColumn = listColumns[column].children;
  if (!dragging) {
    if (!selectedColumn[id].textContent) {
      delete selectedArray[id];
    } else {
      selectedArray[id] = selectedColumn[id].textContent;
    }
    updateDOM();
  }
}

// 콜럼 리스트 업데이트, 텍스트 리셋
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = "";
  updateDOM(column);
}

// 추가 되는 input 보여주기
function showInputBox(column) {
  addBtns[column].style.visibility = "hidden";
  saveItemBtns[column].style.display = "flex";
  addItemContainers[column].style.display = "flex";
}

// input 숨기기
function hideInputBox(column) {
  addBtns[column].style.visibility = "visible";
  saveItemBtns[column].style.display = "none";
  addItemContainers[column].style.display = "none";
  addToColumn(column);
}

// 배열 Drag & Drop 되게 하기
function rebuildArrays() {
  backlogListArray = [];
  for (let i = 0; i < backlogListEl.children.length; i++) {
    backlogListArray.push(backlogListEl.children[i].textContent);
  }
  progressListArray = [];
  for (let i = 0; i < progressListEl.children.length; i++) {
    progressListArray.push(progressListEl.children[i].textContent);
  }
  completeListArray = [];
  for (let i = 0; i < completeListEl.children.length; i++) {
    completeListArray.push(completeListEl.children[i].textContent);
  }
  onHoldListArray = [];
  for (let i = 0; i < onHoldListEl.children.length; i++) {
    onHoldListArray.push(onHoldListEl.children[i].textContent);
  }
  updateDOM();
}

// 아이템이 콜럼 칸에 올라갔을때
function dragEnter(column) {
  listColumns[column].classList.add("over");
  currentColumn = column;
}

// 드레그 시작했을때
function drag(e) {
  draggedItem = e.target;
  dragging = true;
}

// 드롭 했을때
function allowDrop(e) {
  e.preventDefault();
}

// 드롭 하고 있을때
function drop(e) {
  e.preventDefault();
  const parent = listColumns[currentColumn];
  // 뒷 배경과 패딩 삭제
  listColumns.forEach((column) => {
    column.classList.remove("over");
  });
  // 콜럼에 아이템 추가
  parent.appendChild(draggedItem);
  // 드레그 끝
  dragging = false;
  rebuildArrays();
}

// On Load
updateDOM();
