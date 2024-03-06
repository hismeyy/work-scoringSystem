import os
import tkinter as tk
from tkinter import filedialog

import webview

from script.parsing_excel import *

data = None
operation_data = None
score_data = []
project_data = []
result_project_data = []
g_result = []

g_car_model = None
g_tester_name = None
g_file_path = None

g_page_num = -1


class Api:
    def startTest(self, car_model, tester_name, file_path):
        global data
        global operation_data
        global score_data
        global project_data
        global result_project_data
        global g_car_model
        global g_tester_name
        global g_file_path

        print("车型:", car_model)
        print("测试员名字:", tester_name)
        print("文件:", file_path)

        g_car_model = car_model
        g_tester_name = tester_name
        g_file_path = file_path

        data = read_excel_file(file_path)
        operation_data = get_operation(data)
        score_data = get_score(data)
        project_data = get_project(data)
        result_project_data = build_data(operation_data, score_data, project_data)

        obj = {
            "g_page_num": g_page_num,
            "operation_data": operation_data
        }
        return obj

    def defaultScore(self, index):
        # 确保全局变量可访问
        global score_data
        global g_result
        global operation_data

        # 从operation_data中根据index获取得分列表，并去掉第一个元素（假定为非得分数据）
        temp_data = operation_data
        score_list = temp_data[int(index)][1:]

        # 使用列表推导式优化得分列表的计算过程
        # 如果原始得分为1，则新得分为6，否则为0
        result_score_list = [6 if int(score) == 1 else 0 for score in score_list]

        # 构造要添加的新结果对象
        obj = {
            "index": int(index),
            "result_score_list": result_score_list
        }

        # 使用列表推导式优化移除相同index对象的过程
        # 只保留index不同的对象
        g_result = [o for o in g_result if o["index"] != int(index)]

        # 将新的结果对象添加到列表中
        g_result.append(obj)

        return g_result

    def nextPage(self, index):
        global result_project_data
        global score_data
        global operation_data

        temp_data = operation_data
        score_list = temp_data[int(index)][1:]

        i = 0
        result_project = []
        for score in score_list:
            if int(score) == 1:
                result_project.append(result_project_data[i])
            i += 1
        return result_project

    def getFile(self):
        root = tk.Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        root.quit()
        root.destroy()
        return file_path


if __name__ == '__main__':
    # 初始化API和webview窗口
    api = Api()

    # 获取当前脚本所在目录的路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# 构建HTML文件的路径
html_file_path = os.path.join(current_dir, './views/start/index.html')

# 使用file协议和绝对路径加载本地HTML文件
url = 'file://' + html_file_path

window = webview.create_window(
    title='车型测试程序',
    url=url,  # 修改这里来加载指定的HTML文件
    js_api=api

)

webview.start(debug=True)
