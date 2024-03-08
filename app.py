from datetime import datetime
import os
import tkinter as tk
from tkinter import filedialog
import anytree

import webview

from script.parsing_excel import *

data = None
operation_data = []
score_data = []
project_data = []
result_project_data = []
g_result = []

g_car_model = None
g_tester_name = None
g_file_path = None

g_page_num = -1


class Api:
    def startTest(self, car_model, tester_name, file_path, flag):
        global data
        global operation_data
        global score_data
        global project_data
        global result_project_data
        global g_car_model
        global g_tester_name
        global g_file_path
        global g_result
        global g_page_num

        print(flag)
        if not flag:
            # 清空所有的值
            data = None
            operation_data = []
            score_data = []
            project_data = []
            result_project_data = []
            g_result = []

            g_car_model = None
            g_tester_name = None
            g_file_path = None

            g_page_num = -1


        g_car_model = car_model
        g_tester_name = tester_name
        g_file_path = file_path

        data = read_excel_file(file_path)
        operation_data = get_operation(data)
        score_data = get_score(data)
        project_data = get_project(data)
        result_project_data = build_data(operation_data, score_data, project_data)

        print(project_data)

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
        print(g_result)

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

    def getScoreProject(self, item):
        global score_data
        global project_data
        temp_data_list = project_data
        temp_data_list = temp_data_list[len(temp_data_list) - 1:][0]
        i = 0
        for temp in temp_data_list:
            if temp == item:
                break
            i = i + 1
        return i

    def getScorePage(self, index):
        global score_data
        result = []
        for score_list in score_data:
            result.append(score_list[int(index)])
        return result

    def setScorp(self, index, i, score):
        global g_result
        global operation_data
        obj = None
        for temp in g_result:
            if temp["index"] == int(index):
                obj = temp  # 如果找到了匹配的index，直接返回该对象
        if obj is None:
            # 如果没有找到，创建一个新的对象
            result_score_list = [None] * len(operation_data[0])
            result_score_list[int(i)] = int(score)
            # 构造要添加的新结果对象
            obj = {
                "index": int(index),
                "result_score_list": result_score_list
            }
            g_result.append(obj)
        else:
            result_score_list = obj["result_score_list"]
            result_score_list[int(i)] = int(score)
        return g_result

    def getFile(self):
        root = tk.Tk()
        root.withdraw()
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        root.quit()
        root.destroy()
        return file_path

    def outScore(self):
        global g_car_model
        global g_tester_name
        global g_file_path
        global operation_data
        global g_result
        root = tk.Tk()
        root.withdraw()  # 隐藏主窗口
        folder_path = filedialog.askdirectory()  # 弹出对话框让用户选择文件夹
        root.quit()
        root.destroy()

        # 获取当前日期
        current_date = datetime.now().strftime("%Y.%m.%d")

        # 构建文件名
        file_name = f"{g_car_model}-{g_tester_name}-{current_date}.xlsx"

        # 开始行数
        start_row = 0
        with open('./conf/app.ini', 'r') as f:
            # 读取第一行
            first_line = f.readline()
            # 判断是否包含指定字符串
            if 'operation_start_row=' in first_line:
                # 获取等号后的数字部分并转换为整数
                start_row = int(first_line.split('=')[1])
            else:
                print("No operation_start_row found in the first line.")

        max_row = len(operation_data) + start_row # 20

        workbook = openpyxl.load_workbook(g_file_path)
        sheet = workbook.active

        for i in range(start_row, max_row):
            for temp_result in g_result:
                index = int(temp_result["index"])
                if index == i - start_row:
                    # 是当前需要的分数值
                    result_score_list = temp_result["result_score_list"]
                    result_score_list_size = len(result_score_list)
                    for lie in range(1, result_score_list_size + 1):
                        if result_score_list[lie - 1] != 0:
                            sheet.cell(row=i, column=lie + 1).value = result_score_list[lie - 1]
                        else:
                            sheet.cell(row=i, column=lie + 1).value = None

        output_path = os.path.join(folder_path, file_name)
        # 保存工作簿
        workbook.save(output_path)


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
