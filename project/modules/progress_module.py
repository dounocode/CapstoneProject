# progress_module.py

# 강의 정보 (초 단위)
lectures = {
    "lecture1": {
        "path": r"\CAPSTONE_BACKEND\project\static\videos\lecture1.mp4",
        "duration": 172,  # 2분 52초
        "current_time": 0  # 강의별 시청 시간 초기화
    },
    "lecture2": {
        "path": r"\CAPSTONE_BACKEND\project\static\videos\lecture2.mp4",
        "duration": 117,  # 1분 57초
        "current_time": 0  # 강의별 시청 시간 초기화
    }
}

def update_progress(lecture_id, current_time):
    """
    강의의 진행 상태를 업데이트하고, 강의 완료 여부를 반환합니다.
    
    Parameters:
    - lecture_id: 강의 ID ('lecture1' 또는 'lecture2')
    - current_time: 현재까지 시청한 시간 (초 단위)
    
    Returns:
    - dict: {"lecture_completed": bool} 완료 여부를 담은 딕셔너리
    """
    # 강의 정보 확인
    if lecture_id not in lectures:
        return {"error": "Invalid lecture ID"}
    
    lecture_duration = lectures[lecture_id]["duration"]

    # 진행 상태 업데이트
    lectures[lecture_id]["current_time"] = min(current_time, lecture_duration)
    
    # 강의가 완료되었는지 여부 확인
    lecture_completed = lectures[lecture_id]["current_time"] >= lecture_duration
    
    return {"lecture_completed": lecture_completed}

