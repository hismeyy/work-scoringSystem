import openpyxl


def read_excel_file(file_path):
    try:
        data = []
        workbook = openpyxl.load_workbook(file_path)
        sheet = workbook.active
        for row in sheet.iter_rows(values_only=True):
            # print(row)
            data.append(row)
        return data
    except Exception as e:
        print(f"An error occurred while reading the Excel file: {e}")


def get_operation(data):
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
    operation_data = data[start_row - 1:]
    return operation_data


def get_score(data):
    start_row = 0
    with open('./conf/app.ini', 'r') as f:
        # 读取第一行
        _ = f.readline()
        second_line = f.readline()
        # 判断是否包含指定字符串
        if 'score_start=' in second_line:
            # 获取等号后的数字部分并转换为整数
            start_row = int(second_line.split('=')[1])
        else:
            print("No operation_start_row found in the first line.")
    score_data = data[start_row - 1:start_row + 9]
    return score_data


def get_project(data):
    end_row = 0
    with open('./conf/app.ini', 'r') as f:
        # 读取第一行
        _ = f.readline()
        _ = f.readline()
        three_line = f.readline()
        # 判断是否包含指定字符串
        if 'project_end=' in three_line:
            # 获取等号后的数字部分并转换为整数
            end_row = int(three_line.split('=')[1])
        else:
            print("No operation_start_row found in the first line.")
    project_data = data[0:end_row]
    return project_data


def build_data(operation_data, score_data, project_data):
    result_data = []
    data = {
        'operation': '',

    }

    column = 0
    end_row = 0
    with open('./conf/app.ini', 'r') as f:
        # 读取第一行
        _ = f.readline()
        _ = f.readline()
        three_line = f.readline()
        four_line = f.readline()
        # 判断是否包含指定字符串
        if 'project_end=' in three_line:
            # 获取等号后的数字部分并转换为整数
            end_row = int(three_line.split('=')[1])
        if 'column=' in four_line:
            # 获取等号后的数字部分并转换为整数
            column = int(four_line.split('=')[1])
        else:
            print("No operation_start_row found in the first line.")

    project_list = []
    for project in project_data:
        project = project[1:]
        project_list.append(project)

    for a in range(0, column - 1):
        temp_list = []
        for b in range(0, end_row):
            temp_list.append(project_list[b][a])
        result_data.append(temp_list)

    return result_data
