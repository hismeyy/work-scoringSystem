def get_config():
    with open('./conf/app.ini', 'r') as f:
        # 读取第一行
        operation_start_row = f.readline()  # 操作开始行
        score_start = f.readline()  # 分数开始行
        project_end = f.readline()  # 打分项结束行
        column = f.readline()  # 列数
        # 判断是否包含指定字符串
        if 'operation_start_row=' in operation_start_row:
            operation_start_row = int(operation_start_row.split('=')[1])
        if 'score_start=' in score_start:
            score_start = int(score_start.split('=')[1])
        if 'project_end=' in project_end:
            project_end = int(project_end.split('=')[1])
        if 'column=' in column:
            column = int(column.split('=')[1])
        else:
            print("No operation_start_row found in the first line.")
        return operation_start_row, score_start, project_end, column
