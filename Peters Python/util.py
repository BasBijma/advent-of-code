def get_int_csv(filename):
    result = []
    with open(filename, 'r') as f:
        for line in f:
            line = line.strip()
            if line:
                result.append([int(x) for x in line.split(',')])
    return result
