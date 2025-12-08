from Box import Box
import util
import sys

sys.set_int_max_str_digits(0)  # Remove limit for large integer printing

# bas 171503


def solve_part1():
    boxes = load_data("input.txt")
    result = 0
    
    for _ in range(1000):
        boxes = sorted(boxes, key=lambda b: b.distances[0][1])
        merge_nearest(boxes)
    
    groups = []
    for box in boxes:
        group = {b.id for b in box.connected_to}
        if group not in groups:
            groups.append(group)
    
    top3 = [len(g) for g in sorted(groups, key=len, reverse=True)[:3]]
    
    print(top3)
    
    # print(len(boxes))
    
    result = 1
    for n in top3:
        result *= n

    return result


def merge_nearest(boxes: list[Box]):
    box = boxes[0]
    return box.connect_to_nearest()


def solve_part2():
    boxes = load_data("input.txt")
    result = 0
    
    iteration = 0
    last_connection = None
    while len(boxes[0].connected_to) < len(boxes):
        boxes = sorted(boxes, key=lambda b: b.distances[0][1])
        last_connection = merge_nearest(boxes)
        iteration += 1
        if iteration % 100 == 0:
            print(f"Iteration {iteration}: {len(boxes[0].connected_to)}/{len(boxes)}")
# it returned all the boxes *= result
    return f"Last connection: {last_connection[0].coords} <-> {last_connection[1].coords}" 


def load_data(filename):
    coords_list = util.get_int_csv(filename)
    boxes: list[Box] = []
    for coords in coords_list:
        boxes.append(Box(len(boxes), coords))
    
    for box in boxes:
        box.set_distances(boxes)
    
    for box in boxes:
        box.sort_distances()
        
    return boxes
        

def main():
    print(f"Part 1: {solve_part1()}")
    print(f"Part 2: {solve_part2()}")


if __name__ == "__main__":
    main()
