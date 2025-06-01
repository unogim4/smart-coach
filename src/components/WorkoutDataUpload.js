import React, { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';

function WorkoutDataUpload({ onDataLoaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'json') {
      // JSON 파일 처리
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          validateAndProcessData(data);
        } catch (err) {
          setError('JSON 파일 파싱 오류: ' + err.message);
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'csv') {
      // CSV 파일 처리
      Papa.parse(file, {
        complete: (results) => {
          try {
            const data = processCSVData(results.data);
            validateAndProcessData(data);
          } catch (err) {
            setError('CSV 파일 처리 오류: ' + err.message);
            setUploading(false);
          }
        },
        header: true,
        error: (err) => {
          setError('CSV 파일 파싱 오류: ' + err.message);
          setUploading(false);
        }
      });
    } else {
      setError('JSON 또는 CSV 파일만 지원됩니다.');
      setUploading(false);
    }
  };

  const processCSVData = (csvData) => {
    // CSV 데이터를 우리 형식으로 변환
    const heartRateData = [];
    const respiratoryRateData = [];
    
    csvData.forEach((row) => {
      if (row.heartRate) {
        heartRateData.push(parseInt(row.heartRate));
      }
      if (row.respiratoryRate) {
        respiratoryRateData.push(parseInt(row.respiratoryRate));
      }
    });

    return {
      heartRateData,
      respiratoryRateData
    };
  };

  const validateAndProcessData = (data) => {
    // 데이터 유효성 검사
    if (!data.heartRateData || !Array.isArray(data.heartRateData)) {
      throw new Error('심박수 데이터가 없거나 잘못된 형식입니다.');
    }
    
    if (!data.respiratoryRateData || !Array.isArray(data.respiratoryRateData)) {
      throw new Error('호흡수 데이터가 없거나 잘못된 형식입니다.');
    }

    // 데이터 길이 확인
    if (data.heartRateData.length === 0) {
      throw new Error('심박수 데이터가 비어있습니다.');
    }

    // 부모 컴포넌트로 데이터 전달
    onDataLoaded(data);
    setSuccess(true);
    setUploading(false);

    // 3초 후 성공 메시지 제거
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <input
        accept=".json,.csv"
        style={{ display: 'none' }}
        id="workout-data-upload"
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      <label htmlFor="workout-data-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
          fullWidth
        >
          {uploading ? '업로드 중...' : '운동 데이터 파일 업로드 (JSON/CSV)'}
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          운동 데이터가 성공적으로 로드되었습니다!
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          지원 형식:
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • JSON: {"{ \"heartRateData\": [65, 85, ...], \"respiratoryRateData\": [15, 18, ...] }"}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • CSV: 헤더에 "heartRate"와 "respiratoryRate" 포함
        </Typography>
      </Box>
    </Box>
  );
}

export default WorkoutDataUpload;