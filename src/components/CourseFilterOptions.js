import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  FormControl, 
  Select, 
  MenuItem,
  InputLabel,
  Paper
} from '@mui/material';

function CourseFilterOptions({ onFilterChange, initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences || {
    type: 'running',
    maxDistance: 10,
    maxStartDistance: 5,
    difficulty: 'any'
  });

  const handleChange = (name) => (event, newValue) => {
    const value = event.target ? event.target.value : newValue;
    
    const updatedPreferences = {
      ...preferences,
      [name]: value
    };
    
    setPreferences(updatedPreferences);
    onFilterChange(updatedPreferences);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
        코스 필터
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel id="course-type-label">코스 유형</InputLabel>
          <Select
            labelId="course-type-label"
            value={preferences.type}
            onChange={handleChange('type')}
            label="코스 유형"
          >
            <MenuItem value="any">모든 유형</MenuItem>
            <MenuItem value="running">러닝</MenuItem>
            <MenuItem value="biking">자전거</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel id="difficulty-label">난이도</InputLabel>
          <Select
            labelId="difficulty-label"
            value={preferences.difficulty}
            onChange={handleChange('difficulty')}
            label="난이도"
          >
            <MenuItem value="any">모든 난이도</MenuItem>
            <MenuItem value="beginner">초급</MenuItem>
            <MenuItem value="intermediate">중급</MenuItem>
            <MenuItem value="advanced">고급</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          최대 코스 거리: {preferences.maxDistance}km
        </Typography>
        <Slider
          size="small"
          value={preferences.maxDistance}
          onChange={handleChange('maxDistance')}
          min={5}
          max={30}
          step={5}
          marks
          valueLabelDisplay="auto"
        />
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          시작점까지 거리: {preferences.maxStartDistance}km
        </Typography>
        <Slider
          size="small"
          value={preferences.maxStartDistance}
          onChange={handleChange('maxStartDistance')}
          min={1}
          max={10}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>
    </Paper>
  );
}

export default CourseFilterOptions;