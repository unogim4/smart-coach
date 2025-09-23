      {/* 상단 정보 바 */}
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {(exerciseData.distance / 1000).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">킬로미터</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {formatTime(exerciseData.time)}
            </div>
            <div className="text-xs text-gray-400">시간</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {exerciseData.speed}
            </div>
            <div className="text-xs text-gray-400">km/h</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 안내 */}
      {currentInstruction && (
        <div className="bg-blue-600 text-white p-3">
          <div className="text-lg font-bold">{currentInstruction}</div>
          {nextInstruction && (
            <div className="text-sm opacity-75 mt-1">{nextInstruction}</div>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* GPS 상태 표시 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              gpsStatus === '연결됨' ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              gpsStatus === '시뮬레이션' ? 'bg-purple-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {simulationMode ? '시뮬레이션' : `GPS: ${gpsStatus}`}
            </span>
            {gpsAccuracy > 0 && !simulationMode && (
              <span className="text-xs text-gray-500">(±{gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 시뮬레이션 모드 표시 */}
        {simulationMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">🎬</div>
              <span className="text-sm font-bold">온천장 코스 시뮬레이션 모드</span>
            </div>
          </div>
        )}

        {/* 진행률 바 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-48">
          <div className="text-sm font-medium mb-1">진행률</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${routeProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{routeProgress.toFixed(0)}% 완료</div>
        </div>

        {/* AI 코치 메시지 */}
        <div className="absolute bottom-32 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">AI 코치</div>
              <div className="text-base font-semibold">{coachMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 및 컨트롤 */}
      <div className="bg-gray-800 text-white p-4">
        {/* 상세 데이터 */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-400">{exerciseData.heartRate}</div>
            <div className="text-xs text-gray-400">BPM</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{exerciseData.pace}</div>
            <div className="text-xs text-gray-400">페이스</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-400">{exerciseData.calories}</div>
            <div className="text-xs text-gray-400">칼로리</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{exerciseData.steps}</div>
            <div className="text-xs text-gray-400">걸음</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          {!isExercising ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <i className="fas fa-play mr-2"></i>
              운동 시작
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeExercise}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  계속
                </button>
              ) : (
                <button
                  onClick={pauseExercise}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  일시정지
                </button>
              )}
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <i className="fas fa-stop mr-2"></i>
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking;