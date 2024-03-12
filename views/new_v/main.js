confirmModal = $('#confirmModal')
out = $('#out')
oper = ""

g_index = null // 代表当前给那个操作打分
// 获取文件
function getFile() {
    // 调用 Python 端定义的函数
    pywebview.api.get_file().then(function (response) {
        file_path = response
        document.getElementById('fileUpload').innerText = file_path;
    });
}

// 点击开始
function startTest(flag) {

    let carModel = document.getElementById('carModel').value;
    let testerName = document.getElementById('testerName').value;
    let file_path = document.getElementById('fileUpload').innerText;
    if (!carModel || !testerName || !file_path) {
        alert("请输入所有的信息！");
        return; // 早期返回以防止进一步执行
    }

    // 设置操作
    pywebview.api.start(file_path, carModel, testerName, flag).then(function (response) {
        // 隐藏box
        document.getElementById('box').style.display = 'none';
        // 显示control
        let controlDiv = document.querySelector('.control');
        controlDiv.style.display = 'block';
        controlDiv.innerHTML = '';
        controlDiv.innerHTML += '<h1 style="font-size: 24px">选择操作：</h1>'

        response.forEach(obj => {
            // 创建按钮
            let button = document.createElement('button');
            button.className = 'ope_button';
            button.textContent = obj.operation;
            button.setAttribute('index', obj.index);

            // 检查g_result数组中是否存在匹配的index
            if (obj.flag) {
                button.style.backgroundColor = '#FFCCCC';
            }

            button.addEventListener('click', function () {
                console.log(this.innerText)
                oper = this.innerText
                getProjectList(obj.index);
            });
            controlDiv.appendChild(button);
        })

        const button1 = document.createElement('button');
        button1.textContent = "测试完成";
        button1.className = 'ope_button';
        // 绑定点击事件
        button1.addEventListener('click', function () {
            // 测试完成
            out.modal("show");
        });
        document.querySelector('.control').appendChild(button1);

        const button2 = document.createElement('button');
        button2.textContent = "回到主页";
        button2.className = 'ope_button';
        // 绑定点击事件
        button2.addEventListener('click', function () {
            // 测试完成 回到主页

            // 获取所有 input 类型的元素
            let inputs = document.querySelectorAll('input[type="text"]');

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
    pywebview.api.default_score(index).then(function (response) {
        startTest(false)
    })
}

function yes(index) {
    pywebview.api.next_page(index).then(function (response) {
        console.log(response)
        // // 清空
        document.querySelector('.control').innerHTML = '';

        document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">当前操作 :<span style="font-weight: bold">' + oper + '</span></h1><br>'
        document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">您觉得优点或缺点在于<span style="color: #FFCCCC">哪个过程</span>？</h1>'

        response.forEach(obj => {
            // 创建按钮并设置内容
            const button = document.createElement('button');
            button.className = 'ope_button';
            button.textContent = obj.project;
            button.setAttribute('data-category', obj.project);

            if (obj.flag) {
                button.style.backgroundColor = '#FFCCCC';
            }

            // 绑定点击事件
            button.addEventListener('click', function () {
                console.log(obj.project)
                clickScoreItem(index, obj.project)
            });

            // 将按钮添加到div中
            document.querySelector('.control').appendChild(button);

        });

        // 创建上一页
        // 创建按钮并设置内容
        const up_button = document.createElement('button');
        up_button.textContent = "返回高一级菜单";
        up_button.className = 'ope_button';
        // 绑定点击事件
        up_button.addEventListener('click', function () {
            pywebview.api.up_page(index, null).then(function (response) {
                if (response === "goto0") {
                    // 去第一页 调用
                    startTest(false)
                }
            })
        });
        document.querySelector('.control').appendChild(up_button);
    })
}


function clickScoreItem(index, projectName) {
    pywebview.api.get_other_project(index, projectName).then(function (response) {
        if (response !== 'score') {
            console.log(response)
            // // 清空
            document.querySelector('.control').innerHTML = '';
            document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">当前操作 :<span style="font-weight: bold">' + oper + '</span></h1><br>'
            document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">您觉得' + '<span style="color: #FFCCCC">' + projectName + ' </span> 存在哪些优点或缺点？</h1>'

            response.forEach(obj => {
                // 创建按钮并设置内容
                const button = document.createElement('button');
                button.className = 'ope_button';
                button.textContent = obj.project;
                button.setAttribute('data-category', obj.project);
                if (obj.flag) {
                    button.style.backgroundColor = '#FFCCCC';
                }
                // 绑定点击事件
                button.addEventListener('click', function () {
                    clickScoreItem(index, obj.project)
                });

                // 将按钮添加到div中
                document.querySelector('.control').appendChild(button);
            })

            // 创建上一页
            // 创建按钮并设置内容
            const button = document.createElement('button');
            button.textContent = "返回高一级菜单";
            button.className = 'ope_button';
            // 绑定点击事件
            button.addEventListener('click', function () {
                pywebview.api.up_page(index, projectName).then(function (response) {
                    console.log(projectName)
                    if (response === "goto1") {
                        // 去第一页 调用
                        yes(g_index)
                    } else {
                        clickScoreItem(index, response)
                    }

                })
            });
            document.querySelector('.control').appendChild(button);

        } else {
            // 拿出打分项目
            console.log("到底了")
            pywebview.api.get_score_data(index, projectName).then(function (response) {
                console.log(response)
                // // 清空
                document.querySelector('.control').innerHTML = '';
                document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">当前操作 :<span style="font-weight: bold">' + oper + '</span></h1><br>'
                document.querySelector('.control').innerHTML += '<h1 style="font-size: 18px">您觉得<span style="color: #FFCCCC"> ' + projectName + '</span> 能打几分？</h1>'

                response.forEach((obj, obj_index) => {
                    obj = obj === null ? "" : obj
                    // 创建按钮并设置内容
                    const button = document.createElement('button');
                    button.className = 'ope_button score_button';
                    button.textContent = `${obj_index + 1}：${obj}`;
                    // 绑定点击事件
                    button.addEventListener('click', function () {
                        // 传两个值 一个是打分项目，另一个是打分值
                        pywebview.api.set_score(index, projectName, obj_index + 1).then(function (response) {
                            console.log(response)
                            clickScoreItem(index, response)
                        })
                    });

                    // 将按钮添加到div中
                    document.querySelector('.control').appendChild(button);
                })
            })
        }

    })

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
    pywebview.api.out_score().then(function (response) {

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


