confirmModal = $('#confirmModal')
out = $('#out')
g_result = [] // 得分对象
g_index = undefined // 选择的第几个操作
current_project = [] // 当前的打分项目
current_index = -1 // 当前的打分项目索引
up_self = null // 用来放回上一层的数据
up_data_category = "" // 点击具体打分项目

self_one = null
self_two = null
self_three = null

stark = []


// 获取文件
function getFile() {
    // 调用 Python 端定义的函数
    pywebview.api.getFile().then(function (response) {
        file_path = response
        document.getElementById('fileUpload').innerText = file_path;
    });
}

// 点击开始
function startTest(flag) {
    // 清空所有的值
    if (!flag) {
        console.log(flag)
        confirmModal = $('#confirmModal')
        out = $('#out')
        g_result = [] // 得分对象
        g_index = undefined // 选择的第几个操作
        current_project = [] // 当前的打分项目
        current_index = -1 // 当前的打分项目索引
        up_self = null // 用来放回上一层的数据
        up_data_category = "" // 点击具体打分项目

        self_one = null
        self_two = null
        self_three = null

        stark = []
    }

    let carModel = document.getElementById('carModel').value;
    let testerName = document.getElementById('testerName').value;
    let file_path = document.getElementById('fileUpload').innerText;
    if (!carModel || !testerName || !file_path) {
        alert("请输入所有的信息！");
        return; // 早期返回以防止进一步执行
    }

    // 设置操作
    pywebview.api.startTest(carModel, testerName, file_path, flag).then(function (response) {
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

        const button1 = document.createElement('button');
        button1.textContent = "测试完成";
        button1.className = 'ope_button';
        // 绑定点击事件
        button1.addEventListener('click', function () {
            // 测试完成
            console.log("测试完成")
            out.modal("show");
        });
        document.querySelector('.control').appendChild(button1);

        const button2 = document.createElement('button');
        button2.textContent = "回到主页";
        button2.className = 'ope_button';
        // 绑定点击事件
        button2.addEventListener('click', function () {
            // 测试完成 回到主页
            console.log("回到主页")

            // 获取所有 input 类型的元素
            var inputs = document.querySelectorAll('input[type="text"]');

            // 遍历这些元素，并清空它们的值
            inputs.forEach(function (input) {
                input.value = '';
            });

            // 清空 fileUpload 标签的内容
            document.getElementById('fileUpload').innerHTML = '';

            document.getElementById('box').style.display = 'block';
            document.querySelector('.control').style.display = 'none';


        });
        document.querySelector('.control').appendChild(button2);
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
        startTest(true)
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
                stark.push(this)
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
        pywebview.api.getScoreProject(self.getAttribute('data-category')).then(function (response1) {
            console.log(response1)
            pywebview.api.getScorePage(response1).then(function (response2) {
                console.log(response2)
                controlDiv = document.querySelector('.control')
                controlDiv.innerHTML = ''

                controlDiv.innerHTML += '<h1 style="font-size: 24px">您觉得<span style="color: red"> ' + self.innerText + '</span> 能打几分？</h1>'
                response2.forEach((value, index) => {
                    if (value == null) {
                        value = ''
                    }
                    let button = document.createElement('button');
                    button.className = 'ope_button score_button';
                    button.textContent = `${index + 1}：${value}`;
                    button.setAttribute('data-index', index);

                    // 检查g_result数组中是否存在匹配的index
                    // const isIndexMatched = g_result.some(obj => obj.index === index);
                    // if (isIndexMatched) {
                    //     // 如果存在匹配的index，设置按钮的背景颜色为红色
                    //     button.style.backgroundColor = 'red';
                    // }

                    button.addEventListener('click', function () {
                        console.log("按钮点击，索引：", this.getAttribute('data-index'));
                        console.log("g_index", g_index)
                        console.log("response1", response1)
                        console.log("score", index + 1)
                        pywebview.api.setScorp(g_index, response1, index + 1).then(function (result) {
                            current_index--
                            current_index--
                            console.log(result)
                            stark.pop()
                            temp = stark.pop()
                            clickScoreItem(temp, data)
                            stark.push(temp)

                        })
                    });
                    controlDiv.appendChild(button);
                });

                // 创建按钮并设置内容
                const button = document.createElement('button');
                button.textContent = "回到上一步";
                button.className = 'ope_button';
                button.setAttribute('data-category', 1);
                button.setAttribute('data-index', 1); // 使用局部索引作为示例
                // 绑定点击事件
                button.addEventListener('click', function () {
                    up(self_three, data)
                });
                document.querySelector('.control').appendChild(button);

                current_index++

            })
        })

        return
    }

    // 说明还没有到打分项目 继续生成打分项目
    // 清空.control元素中的内容
    document.querySelector('.control').innerHTML = '';
    document.querySelector('.control').innerHTML += '<h1 style="font-size: 24px">您觉得' + '<span style="color: red">' + self.getAttribute('data-category') + ' </span> 存在哪些优点或缺点？</h1>'
    // 筛选数据
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
            self_three = self_two
            clickScoreItem(this, data)
            console.log(current_index)
            console.log(data[0].length)
            self_two = this
            stark.push(this)

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
        up(self_one, data)
    });
    document.querySelector('.control').appendChild(button);


    current_index++


}

function up(self, data) {
    console.log("up", current_index)
    stark.pop()

    if (current_index === 0) {
        current_index--
        startTest(true)
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
        temp = stark.pop()
        clickScoreItem(temp, data)
        stark.push(temp)

    }
}


document.getElementById('outYes').addEventListener('click', function () {
    outYes();
});

// 选择否
document.getElementById('outNo').addEventListener('click', function () {
    out.modal('hide'); // 关闭模态框
});


// 打印结果
function outYes() {
    console.log("打印结果")
    pywebview.api.outScore().then(function (response) {


        out.modal('hide'); // 关闭模态框

        // 获取所有 input 类型的元素
        var inputs = document.querySelectorAll('input[type="text"]');

        // 遍历这些元素，并清空它们的值
        inputs.forEach(function (input) {
            input.value = '';
        });

        // 清空 fileUpload 标签的内容
        document.getElementById('fileUpload').innerHTML = '';

        document.getElementById('box').style.display = 'block';
        document.querySelector('.control').style.display = 'none';
    })

}


