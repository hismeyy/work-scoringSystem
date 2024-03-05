function startTest() {
    var carModel = document.getElementById('carModel').value;
    var testerName = document.getElementById('testerName').value;
    var file_path = document.getElementById('fileUpload').innerText;
    if (!carModel || !testerName || !file_path) {
        alert("请输入所有的信息！");
        return; // 早期返回以防止进一步执行
    }

    pywebview.api.startTest(carModel, testerName, file_path).then(function (response) {
        document.getElementById('box').style.display = 'none';
        var controlDiv = document.querySelector('.control');
        controlDiv.style.display = 'block';

        controlDiv.innerHTML = '';
        response.operation_data.forEach((operation, index) => {
            var button = document.createElement('button');
            button.className = 'ope_button';
            button.textContent = operation[0];
            button.setAttribute('data-index', index);
            button.addEventListener('click', function () {
                console.log('Button index:', this.getAttribute('data-index'));
            });
            controlDiv.appendChild(button);
        });
    })
}

function getFile() {
    // 调用 Python 端定义的函数
    pywebview.api.getFile().then(function (response) {
        file_path = response
        document.getElementById('fileUpload').innerText = file_path;
    });
}
