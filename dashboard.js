// ===============================
// Forest Focus Dashboard
// ===============================

// عناصر الصفحة
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");
const progressBar = document.getElementById("progressBarFill");
const progressPercent = document.getElementById("progressPercent");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const pointsText = document.getElementById("pointsText");
const welcomeText = document.getElementById("welcomeText");

// ===============================
// المستخدم الحالي
// ===============================
const currentUser = localStorage.getItem("currentUser") || "Guest";
function userKey(name){
    return currentUser + "_" + name;
}

// ===============================
// تحميل البيانات
// ===============================
let tasks = JSON.parse(localStorage.getItem(userKey("tasks"))) || [];
let points = parseInt(localStorage.getItem(userKey("points"))) || 0;

// ===============================
// الاقتباسات والترحيب
// ===============================
const quotesEn = [
    "Stay focused and never give up.",
    "Small progress is still progress.",
    "Every study session grows your future.",
    "Success comes from consistency.",
    "One task at a time."
];
const quotesAr = [
    "ركّز على هدفك ولا تستسلم أبدًا.",
    "التقدم الصغير لا يزال تقدمًا.",
    "كل جلسة دراسة تنمي مستقبلك.",
    "النجاح يأتي من الاستمرارية.",
    "مهمة واحدة في كل مرة."
];

function updateWelcomeText() {
    const isAr = document.documentElement.lang === 'ar';
    welcomeText.textContent = isAr ? `👋 مرحبًا بك، ${currentUser}` : `👋 Welcome, ${currentUser}`;
}

function updateQuote() {
    const quoteText = document.getElementById("quoteText");
    if(quoteText) {
        const isAr = document.documentElement.lang === 'ar';
        const currentQuotes = isAr ? quotesAr : quotesEn;
        quoteText.textContent = currentQuotes[Math.floor(Math.random() * currentQuotes.length)];
    }
}

// ===============================
// حفظ البيانات
// ===============================
function saveData(){
    localStorage.setItem(userKey("tasks"), JSON.stringify(tasks));
    localStorage.setItem(userKey("points"), points);
}

// ===============================
// تحديث الإحصائيات
// ===============================
function updateStats(){
    const completed = tasks.filter(task => task.completed).length;
    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    remainingTasks.textContent = tasks.length - completed;
    pointsText.textContent = points;

    let percent = 0;
    if(tasks.length > 0){
        percent = Math.round((completed / tasks.length) * 100);
    }
    progressPercent.textContent = percent + "%";
    progressBar.style.width = percent + "%";
}

// ===============================
// إنشاء عنصر المهمة
// ===============================
function createTaskElement(task){
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if(task.completed) {
        li.style.opacity = ".6";
    }

    // تنسيق التاريخ والوقت بشكل شيك لو المستخدم اختاره
    let dateDisplay = "";
    if(task.date) {
        const dateObj = new Date(task.date);
        // تنسيق مريح للقراءة (مثال: 12:30 PM - 18 Jul)
        const formattedDate = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " + dateObj.toLocaleDateString([], {day: 'numeric', month: 'short'});
        dateDisplay = `<span style="font-size: 11px; color: var(--muted); block-size: auto; display: block; margin-top: 2px;">📅 ${formattedDate}</span>`;
    }

    li.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; flex: 1;">
            <input type="checkbox" class="checkTask" ${task.completed ? "checked" : ""}>
            <div style="display: flex; flex-direction: column;">
                <span class="task-text-span" style="${task.completed ? "text-decoration:line-through;" : ""}">
                    ${task.priority} ${task.text}
                </span>
                ${dateDisplay}
            </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button class="action-icon-btn editBtn" type="button" style="padding: 6px 10px !important; border-radius: 8px !important;">✏️</button>
            <button class="btn-danger deleteBtn" type="button">🗑️</button>
        </div>
    `;
    taskList.appendChild(li);
}

// ===============================
// عرض المهام
// ===============================
function renderTasks(){
    taskList.innerHTML = "";
    tasks.forEach(task => {
        createTaskElement(task);
    });
    updateStats();
}

// ===============================
// إضافة مهمة جديدة
// ===============================
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        addTask();
    }
});

function addTask(){
    const text = taskInput.value.trim();
    if(text === ""){
        alert("Please enter a task.");
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        priority: taskPriority.value,
        date: taskDate.value,
        completed: false,
        pointsAwarded: false // قفل الثغرة: تتبع حماية النقاط لمنع التكرار
    };

    tasks.push(task);
    saveData();
    renderTasks();
    taskInput.value = "";
    taskDate.value = "";
}

// التحكم بالمهام (حذف وتعديل)
taskList.addEventListener("click", function(e){
    // 1. منطق زرار الحذف 🗑️
    if(e.target.classList.contains("deleteBtn") || e.target.parentElement.classList.contains("deleteBtn")){
        const button = e.target.classList.contains("deleteBtn") ? e.target : e.target.parentElement;
        const id = Number(button.closest("li").dataset.id);
        tasks = tasks.filter(task => task.id !== id);
        saveData();
        renderTasks();
    }
    
    // 2. منطق زرار التعديل الجديد ✏️
    if(e.target.classList.contains("editBtn") || e.target.parentElement.classList.contains("editBtn")){
        const button = e.target.classList.contains("editBtn") ? e.target : e.target.parentElement;
        const li = button.closest("li");
        const id = Number(li.dataset.id);
        
        // إيجاد المهمة المراد تعديلها
        const taskToEdit = tasks.find(task => task.id === id);
        
        if(taskToEdit) {
            const newText = prompt("✏️ تعديل اسم المهمة:", taskToEdit.text);
            if(newText && newText.trim() !== "") {
                taskToEdit.text = newText.trim();
                saveData();
                renderTasks();
            }
        }
    }
});


taskList.addEventListener("change", function(e){
    if(e.target.classList.contains("checkTask")){
        const id = Number(e.target.parentElement.parentElement.dataset.id);
        let showEffect = false;
        
        tasks.forEach(task => {
            if(task.id === id){
                if(e.target.checked) {
                    task.completed = true;
                    // تضاف النقاط فقط إذا لم تمنح مسبقاً لهذه المهمة
                    if(!task.pointsAwarded) {
                        if(task.priority === "🔴") points += 30;
                        else if(task.priority === "🟡") points += 20;
                        else points += 10;
                        task.pointsAwarded = true; // تم منحها بنجاح ولن تمنح مرة أخرى
                        showEffect = true;
                    }
                } else {
                    task.completed = false;
                    // اختياري: إذا أردتِ خصم النقاط عند إزالة علامة الصح، يمكنك تفعيل السطرين القادمين:
                    // if(task.priority === "🔴") points -= 30; else if(task.priority === "🟡") points -= 20; else points -= 10;
                    // task.pointsAwarded = false;
                }
            }
        });

        saveData();
        renderTasks();
        checkBadges();
        if(showEffect) triggerLeavesEffect();
    }
});

// مسح الكل
clearAllBtn.addEventListener("click", function(){
    if(confirm("Delete all tasks?")){
        tasks = [];
        points = 0;
        saveData();
        renderTasks();
        checkBadges();
    }
});

// البحث المصلح
searchInput.addEventListener("input", function(){
    const value = this.value.toLowerCase();
    document.querySelectorAll("#taskList li").forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(value) ? "flex" : "none";
    });
});

// ===============================
// الغابة الرقمية المنظمة بالتتابع
// ===============================
const forestModal = document.getElementById("forestModal");
const openForestBtn = document.getElementById("openForestBtn");
const closeForestBtn = document.getElementById("closeForestBtn");
const forestGrid = document.getElementById("forestGrid");

openForestBtn.addEventListener("click", () => {
    renderForest();
    forestModal.style.display = "flex";
});

closeForestBtn.addEventListener("click", () => {
    forestModal.style.display = "none";
});

// ===============================
// نظام الغابات المتعددة (مراحل من 15 مربع)
// ===============================
let currentForestPage = 0; // الصفحة أو الغابة الحالية التي يستعرضها المستخدم

function renderForest() {
    if (!forestGrid) return;
    forestGrid.innerHTML = "";

    // جلب قائمة كل الأشجار التي تم شراؤها حقيقياً
    const allTrees = JSON.parse(localStorage.getItem(userKey("forest"))) || [];
    
    // حساب عدد الغابات المفتوحة بناءً على أن كل غابة تشيل 15 شجرة
    // لو لسه مفيش شجر، يبقى عندنا غابة واحدة على الأقل (صفحة 0)
    const totalForestsNeeded = Math.max(1, Math.ceil(allTrees.length / 15));
    
    // إذا امتلأت الغابة الأخيرة تماماً (مثلاً اشترينا الشجرة رقم 16 أو 31)، نفتح غابة جديدة فوراً وننقل المستخدم إليها
    if (allTrees.length > 0 && allTrees.length % 15 === 0 && localStorage.getItem(userKey("last_checked_length")) != allTrees.length) {
        localStorage.setItem(userKey("last_checked_length"), allTrees.length);
        currentForestPage = totalForestsNeeded; // افتح الغابة الفاضية الجديدة
    }

    // عرض عنوان الغابة الحالية (مثال: الغابة رقم 1) في المودال ليعرف المستخدم أين هو
    const forestTitle = document.getElementById("forestTitle");
    if (forestTitle) {
        const isAr = document.documentElement.lang === 'ar';
        forestTitle.textContent = isAr ? `🌲 الغابة الرقمية (رقم ${currentForestPage + 1})` : `🌲 Digital Forest (#${currentForestPage + 1})`;
    }

    // استخراج الـ 15 شجرة الخاصة بالغابة (الصفحة) الحالية فقط
    const startIndex = currentForestPage * 15;
    const pageTrees = allTrees.slice(startIndex, startIndex + 15);

    // رص الـ 15 مربعاً الثابتين دائماً داخل الغابة الحالية
    for (let i = 0; i < 15; i++) {
        const box = document.createElement("div");
        box.className = "tree-svg-box";

        if (pageTrees[i]) {
            box.textContent = pageTrees[i];
            box.classList.add("planted"); // إضاءة المربع المنبت
        } else {
            box.textContent = "";
        }
        forestGrid.appendChild(box);
    }

    // إضافة أزرار التنقل (السابق والتالي) أسفل الشبكة لمنع العشوائية
    renderForestNavigation(totalForestsNeeded);
}

// دالة لإنشاء أزرار التنقل بين الغابات (القديمة والجديدة)
function renderForestNavigation(totalForests) {
    let navDiv = document.getElementById("forestNavButtons");
    if (!navDiv) {
        navDiv = document.createElement("div");
        navDiv.id = "forestNavButtons";
        navDiv.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:15px; gap:10px;";
        forestGrid.after(navDiv);
    }

    const isAr = document.documentElement.lang === 'ar';
    navDiv.innerHTML = `
        <button id="prevForestBtn" class="action-icon-btn" style="width:auto !important; padding:8px 15px;" ${currentForestPage === 0 ? "disabled style='opacity:0.4;'" : ""}>
            ${isAr ? "⬅️ الغابة السابقة" : "⬅️ Prev Forest"}
        </button>
        <span style="font-size:13px; font-weight:bold; color:var(--text);"> ${currentForestPage + 1} / ${Math.max(1, Math.ceil((JSON.parse(localStorage.getItem(userKey("forest"))) || []).length / 15) + 1)} </span>
        <button id="nextForestBtn" class="action-icon-btn" style="width:auto !important; padding:8px 15px;" ${currentForestPage >= Math.ceil((JSON.parse(localStorage.getItem(userKey("forest"))) || []).length / 15) ? "disabled style='opacity:0.4;'" : ""}>
            ${isAr ? "الغابة التالية ➡️" : "Next Forest ➡️"}
        </button>
    `;

    document.getElementById("prevForestBtn").addEventListener("click", () => {
        if (currentForestPage > 0) { currentForestPage--; renderForest(); }
    });
    document.getElementById("nextForestBtn").addEventListener("click", () => {
        currentForestPage++; renderForest();
    });
}

// تعديل دالة الشراء لتلقائياً تضع الشجرة في الغابة الحالية بالتتابع
document.querySelectorAll(".buy-tree-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        const cost = Number(this.dataset.cost);
        if (points < cost) {
            alert("⚠️ لا توجد نقاط كافية لشراء هذه الشجرة!");
            return;
        }

        points -= cost;
        const forest = JSON.parse(localStorage.getItem(userKey("forest"))) || [];
        let tree = "🌳";

        switch (this.dataset.type) {
            case "pine": tree = "🌲"; break;
            case "sakura": tree = "🌸"; break;
            case "palm": tree = "🌴"; break;
        }

        // دفع الشجرة الجديدة بالتتابع داخل المصفوفة الكاملة
        forest.push(tree);
        localStorage.setItem(userKey("forest"), JSON.stringify(forest));

        // توجيه نظر المستخدم تلقائياً لآخر غابة مفتوحة بيشتري فيها حالياً
        currentForestPage = Math.floor((forest.length - 1) / 15);

        saveData();
        renderForest();
        updateStats();
        
        // تنبيه ذكي لو قفل الغابة الحالية بالكامل
        if (forest.length % 15 === 0) {
            alert(`🎉 مبروك! لقد قمتِ بملء الغابة الحالية بالكامل وفتحتِ غابة جديدة تماماً! 🚀`);
        } else {
            alert(`🎉 تم زراعة الشجرة ${tree} بنجاح في الغابة رقم ${currentForestPage + 1}!`);
        }
        
        triggerLeavesEffect();
    });
});




// ===============================
// صندوق الجوائز
// ===============================
const rewardModal = document.getElementById("rewardBoxModal");
const openBoxBtn = document.getElementById("openBoxBtn");
const closeBoxBtn = document.getElementById("closeBoxBtn");
const claimBoxBtn = document.getElementById("claimBoxBtn");
const rewardText = document.getElementById("rewardResultText");
const animationBox = document.getElementById("boxAnimationDisplay");

openBoxBtn.addEventListener("click", () => { rewardModal.style.display = "flex"; });
closeBoxBtn.addEventListener("click", () => { rewardModal.style.display = "none"; });

claimBoxBtn.addEventListener("click", () => {
    if(points < 50){
        alert("You need 50 points.");
        return;
    }

    points -= 50;
    updateStats();
    saveData();

    const rewards = ["🌳", "🌲", "🌸", "🌴", "🌵", "🍁"];
    animationBox.textContent = "🎁";
    rewardText.textContent = "";

    let counter = 0;
    const effect = setInterval(() => {
        animationBox.textContent = rewards[counter % rewards.length];
        counter++;
    }, 120);

    setTimeout(() => {
        clearInterval(effect);
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        animationBox.textContent = reward;
        rewardText.textContent = "You got " + reward;

        const forest = JSON.parse(localStorage.getItem(userKey("forest"))) || [];
        forest.push(reward);
        localStorage.setItem(userKey("forest"), JSON.stringify(forest));

        renderForest();
        triggerLeavesEffect();
    }, 2000);
});

// ===============================
// Dark Mode
// ===============================
const themeToggle = document.getElementById("themeToggle");
if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Light";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    if(document.body.classList.contains("dark-theme")){
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark";
    }
});

// ===============================
// Language
// ===============================
const langToggle = document.getElementById("langToggle");
langToggle.addEventListener("click", () => {
    const htmlTag = document.getElementById('htmlTag');
    const isEn = htmlTag.getAttribute('lang') === 'en' || !htmlTag.getAttribute('lang');
    htmlTag.setAttribute('lang', isEn ? 'ar' : 'en');
    document.body.dir = isEn ? "rtl" : "ltr";
    
    document.getElementById('mainTitle').innerText = isEn ? "فورست فوكس" : "Forest Focus";
    document.getElementById('mainSubtitle').innerText = isEn ? "منظم الدراسة الذكي" : "Smart Study Planner";
    document.getElementById('focusModeLink').innerText = isEn ? "🎯 جلسة مود التركيز" : "🎯 Focus Mode";
    document.getElementById('addBtn').innerText = isEn ? "إضافة مهمة" : "Add Task";
    document.getElementById('taskInput').placeholder = isEn ? "أدخل مهمة جديدة..." : "Enter a task...";
    document.getElementById('searchInput').placeholder = isEn ? "ابحث عن مهمة..." : "Search Task...";
    document.getElementById('clearAllBtn').innerText = isEn ? "🧹 مسح الكل" : "🧹 Clear All";
    document.getElementById('tasksHeading').innerText = isEn ? "مهامي الحالية" : "My Tasks";
    document.getElementById('btnForestText').innerText = isEn ? "غابتي الرقمية" : "Digital Forest";
    document.getElementById('btnBoxText').innerText = isEn ? "صندوق المكافآت" : "Reward Box";
    document.getElementById('pointsLabel').innerText = isEn ? "النقاط :" : "Points :";
    document.getElementById('statTotal').innerText = isEn ? "الإجمالي :" : "Total :";
    document.getElementById('statDone').innerText = isEn ? "المكتملة :" : "Done :";
    document.getElementById('statLeft').innerText = isEn ? "المتبقية :" : "Left :";
    document.getElementById('forestTitle').innerText = isEn ? "🌲 الغابة الرقمية" : "🌲 Digital Forest";
    document.getElementById('shopTitle').innerText = isEn ? "🛒 متجر الأشجار" : "🛒 Plant Store";
    document.getElementById('boxModalTitle').innerText = isEn ? "🎁 صندوق المكافآت" : "🎁 Tree Reward Box";
    document.getElementById('boxSubText').innerText = isEn ? "افتح الصندوق السحري للحصول على شجرة عشوائية!" : "Open the box to get a random tree!";
    
    updateWelcomeText();
    updateQuote();
});

// ===============================
// Badges
// ===============================
function checkBadges(){
    const done = tasks.filter(t => t.completed).length;
    const badge1 = document.getElementById("badge1");
    const badge2 = document.getElementById("badge2");
    const badge3 = document.getElementById("badge3");

    if(done >= 1 && badge1) badge1.classList.add("unlocked");
    if(done >= 5 && badge2) badge2.classList.add("unlocked");
    if(points >= 100 && badge3) badge3.classList.add("unlocked");
}

// ===============================
// Leaves Animation
// ===============================
function triggerLeavesEffect(){
    const leaves = ["🍃", "🌿", "✨"];
    for(let i = 0; i < 20; i++){
        const leaf = document.createElement("div");
        leaf.className = "leaf-particle";
        leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
        leaf.style.left = Math.random() * 100 + "vw";
        leaf.style.animationDuration = (2 + Math.random() * 3) + "s";
        document.body.appendChild(leaf);
        setTimeout(() => { leaf.remove(); }, 5000);
    }
}

// ===============================
// تشغيل تلقائي
// ===============================
updateWelcomeText();
updateQuote();
renderTasks();
checkBadges();
if (forestGrid) renderForest();
