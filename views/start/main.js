confirmModal = $('#confirmModal')
g_result = [] // 得分对象
g_index = undefined // 选择的第几个操作
current_project = [] // 当前的打分项目
current_index = -1 // 当前的打分项目索引
up_self = null // 用来放回上一层的数据
up_data_category = "" // 点击具体打分项目

self_one = null
self_two = null
self_three = null

// 获取文件
function getFile() {
    // 调用 Python 端定义的函数
    pywebview.api.getFile().then(function (response) {
        file_path = response
        document.getElementById('fileUpload').innerText = file_path;
    });
}

// 点击开始
function startTest() {
    let carModel = document.getElementById('carModel').value;
    let testerName = document.getElementById('testerName').value;
    let file_path = document.getElementById('fileUpload').innerText;
    if (!carModel || !testerName || !file_path) {
        alert("请输入所有的信息！");
        return; // 早期返回以防止进一步执行
    }

    // 设置操作
    pywebview.api.startTest(carModel, testerName, file_path).then(function (response) {
        // 隐藏box
        document.getElementById('box').style.display = 'none';

        // 显示control
        let controlDiv = document.querySelector('.control');
        controlDiv.style.display = 'block';
        controlDiv.innerHTML = '';

        controlDiv.innerHTML += '<h1 style="font-size: 24px">选择操作：</h1>'

        response.operation_data.forEach((operation, index) => {
            let button = document.createElement('button');
            button.className = 'ope_button';
            button.textContent = operation[0];
            button.setAttribute('data-index', index);

            // 检查g_result数组中是否存在匹配的index
            const isIndexMatched = g_result.some(obj => obj.index === index);
            if (isIndexMatched) {
                // 如果存在匹配的index，设置按钮的背景颜色为红色
                button.style.backgroundColor = 'red';
            }

            button.addEventListener('click', function () {
                getProjectList(this.getAttribute('data-index'));
            });
            controlDiv.appendChild(button);
        });
    })
}

// 获取模态框
function getProjectList(index) {
    g_index = index
    confirmModal.modal('show');
}

// 选择是
document.getElementById('confirmYes').addEventListener('click', function () {
    yes(g_index);
    confirmModal.modal('hide'); // 关闭模态框
});

// 选择否
document.getElementById('confirmNo').addEventListener('click', function () {
    no(g_index);
    confirmModal.modal('hide'); // 关闭模态框
});

function no(index) {
    // 所有的等于1的得分项目都为6
    pywebview.api.defaultScore(index).then(function (response) {
        g_result = response
        startTest()
    })
}

function yes(index) {
    // 开始操作项
    pywebview.api.nextPage(index).then(function (response) {
        current_project = response
        // 清空
        document.querySelector('.control').innerHTML = '';

        document.querySelector('.control').innerHTML += '<h1 style="font-size: 24px">您觉得优点或缺点在于<span style="color: red">哪个过程</span>？</h1>'
        const categoryIndices = {};
        response.forEach((item, index) => {
            if (!categoryIndices.hasOwnProperty(item[0])) {
                categoryIndices[item[0]] = index; // 保存该分类首次出现时的索引
            }
        });

        Object.keys(categoryIndices).forEach(category => {
            // 创建按钮并设置内容
            const button = document.createElement('button');
            button.className = 'ope_button';
            button.textContent = category;
            button.setAttribute('data-category', category);
            button.setAttribute('data-index', categoryIndices[category]); // 保存索引

            // 绑定点击事件
            button.addEventListener('click', function () {
                clickScoreItem(this, response)
                self_one = this
            });

            // 将按钮添加到div中
            document.querySelector('.control').appendChild(button);

        });

        // 创建上一步按钮
        const button = document.createElement('button');
        button.textContent = "回到上一步";
        button.className = 'ope_button';
        button.setAttribute('data-category', 1);
        button.setAttribute('data-index', 1); // 使用局部索引作为示例
        // 绑定点击事件
        button.addEventListener('click', function () {
            up(null, response)

        });
        document.querySelector('.control').appendChild(button);

        current_index++

    })
}


function clickScoreItem(self, data) {
    up_data_category = data
    if (current_index >= data[0].length - 1) {
        console.log("最低了")
        return
    }

    // 说明还没有到打分项目 继续生成打分项目
    // 清空.control元素中的内容
    document.querySelector('.control').innerHTML = '';
    document.querySelector('.control').innerHTML += '<h1 style="font-size: 24px">您觉得' + '<span style="color: red">' + self.getAttribute('data-category') + ' </span> 存在哪些优点或缺点？</h1>'
    // 筛选数据
    console.log("current_index", current_index)
    console.log("self", up_self)
    const filteredItems = data.filter(item => item[current_index] === self.getAttribute('data-category'));
    // 提取并去重第二个索引（1索引）的值
    const uniqueCategories = [...new Set(filteredItems.map(item => item[current_index + 1]))];
    uniqueCategories.forEach((category, index) => {
        // 创建按钮并设置内容
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'ope_button';
        button.setAttribute('data-category', category);
        button.setAttribute('data-index', index); // 使用局部索引作为示例
        temp_self = self_two
        // 绑定点击事件
        button.addEventListener('click', function () {
            clickScoreItem(this, data)
            self_two = this
        });

        // 将按钮添加到div中
        document.querySelector('.control').appendChild(button);

    });

    // 创建按钮并设置内容
    const button = document.createElement('button');
    button.textContent = "回到上一步";
    button.className = 'ope_button';
    button.setAttribute('data-category', 1);
    button.setAttribute('data-index', 1); // 使用局部索引作为示例
    // 绑定点击事件
    button.addEventListener('click', function () {
        console.log("执行选项", current_index)
        if (current_index <= 2) {
            console.log("选用第一个", current_index)
            up(self_one, data)
        } else {
            up(temp_self, data)
        }


    });
    document.querySelector('.control').appendChild(button);


    current_index++


}

function up(self, data) {
    console.log("up", current_index)
    if (current_index === 0) {
        current_index--
        startTest()
        return
    }

    if (current_index === 1) {
        current_index--
        current_index--
        yes(g_index)
        return
    }

    if (current_index >= 2) {
        current_index--
        current_index--
        // console.log(this.getAttribute('data-category'))
        clickScoreItem(self, data)

    }
}


