// 백업 복원 스크립트
// 이 파일을 사용하여 백업된 파일들을 원래 위치로 복원할 수 있습니다.

const fs = require('fs');
const path = require('path');

const backupDir = '/Users/gim-eunseong/Desktop/smart-coach/backup_v2_before_simulation';
const srcDir = '/Users/gim-eunseong/Desktop/smart-coach/src';

// 복원할 파일 목록
const filesToRestore = [
  { 
    backup: path.join(backupDir, 'ExerciseTracking.js'),
    target: path.join(srcDir, 'pages', 'ExerciseTracking.js')
  },
  { 
    backup: path.join(backupDir, 'Dashboard.js'),
    target: path.join(srcDir, 'pages', 'Dashboard.js')
  }
];

// 복원 함수
function restoreBackup() {
  console.log('🔄 백업 파일 복원을 시작합니다...');
  
  filesToRestore.forEach(file => {
    try {
      if (fs.existsSync(file.backup)) {
        fs.copyFileSync(file.backup, file.target);
        console.log(`✅ 복원 완료: ${path.basename(file.target)}`);
      } else {
        console.log(`⚠️ 백업 파일이 없습니다: ${file.backup}`);
      }
    } catch (error) {
      console.error(`❌ 복원 실패: ${file.target}`, error.message);
    }
  });
  
  console.log('✨ 백업 복원이 완료되었습니다!');
}

// 백업 확인 함수
function checkBackup() {
  console.log('📁 백업 파일 확인...');
  
  filesToRestore.forEach(file => {
    if (fs.existsSync(file.backup)) {
      const stats = fs.statSync(file.backup);
      console.log(`✅ ${path.basename(file.backup)}: ${stats.size} bytes`);
    } else {
      console.log(`❌ ${path.basename(file.backup)}: 파일 없음`);
    }
  });
}

// 명령어 처리
const command = process.argv[2];

if (command === 'restore') {
  restoreBackup();
} else if (command === 'check') {
  checkBackup();
} else {
  console.log(`
📚 백업 복원 스크립트 사용법:
  
  node restore-backup.js check    - 백업 파일 확인
  node restore-backup.js restore  - 백업 파일 복원
  
  백업 날짜: ${new Date().toLocaleString('ko-KR')}
  백업 버전: v2 (시뮬레이션 기능 추가 전)
  `);
}