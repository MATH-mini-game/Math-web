import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Database, ref, set, onValue } from '@angular/fire/database';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import {
  FindCompositionsConfig,
  VerticalOperationsConfig,
  ChooseAnswerConfig,
  MultiStepProblemConfig,
  FindPreviousNextNumberConfig,
  TapMatchingPairsConfig,
  OrderNumbersConfig,
  CompareNumbersConfig,
  WhatNumberDoYouHearConfig,
  DecomposeNumberConfig,
  WriteNumberInLettersConfig,
  IdentifyPlaceValueConfig,
  ReadNumberAloudConfig
} from '../../types/mini-game-types';
import { update } from 'firebase/database';

@Component({
  selector: 'app-test-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-creation.component.html',
  styleUrl: './test-creation.component.css'
})
export class TestCreationComponent {
  private fb = inject(FormBuilder);
  private db = inject(Database);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  gradeLevels: string[] = [];
  teacherUID: string = ""
  selectedMiniGames: string[] = [];
  allMiniGames: {
    id: string;
    title: string;
    configTemplate: Partial<
      FindCompositionsConfig &
      VerticalOperationsConfig &
      ChooseAnswerConfig &
      MultiStepProblemConfig &
      FindPreviousNextNumberConfig &
      TapMatchingPairsConfig &
      OrderNumbersConfig &
      CompareNumbersConfig &
      WhatNumberDoYouHearConfig &
      DecomposeNumberConfig &
      WriteNumberInLettersConfig &
      IdentifyPlaceValueConfig &
      ReadNumberAloudConfig
    >;
  }[] = [];
  
  testForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    classroomId: ['', Validators.required],
    testDuration: [30, [Validators.required, Validators.min(5)]],
    selectedMiniGames: [[]],
    miniGameConfigs: this.fb.group({})
  });

  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit() {
    this.auth.getCurrentUserWithRole().subscribe(user => {
      if (!user) return;
      this.teacherUID = user.uid;
      const usersRef = ref(this.db, 'users');
  
      onValue(usersRef, (snapshot) => {
        const allUsers = snapshot.val();
        const gradesSet = new Set<string>();
  
        for (const key in allUsers) {
          const student = allUsers[key];
          if (student.role === 'Student' && student.linkedTeacherId === this.teacherUID && student.schoolGrade) {
            gradesSet.add(`${student.schoolGrade}`);
          }
        }
  
        this.gradeLevels = Array.from(gradesSet).sort(); 
      });
    });

    // Load mini-game definitions
    this.http.get('/mini-games.json').subscribe((data: any) => {
      const gameDefs = data.miniGames;
      const selectedGrade = this.testForm.get('classroomId')?.value || '4';
      this.allMiniGames = Object.entries(gameDefs).map(([id, game]: any) => {
        const gradeConfigs = game.defaultConfig?.gradeConfig || {};
        const fallbackConfig = Object.values(gradeConfigs)[0] || {};
        return {
          id,
          title: game.title?.en || id,
          configTemplate: gradeConfigs[selectedGrade] || fallbackConfig
        };
      });
    });
    
  }

  onMiniGameToggle(gameId: string, checked: boolean) {
    const configs = this.testForm.get('miniGameConfigs') as FormGroup;
    if (checked) {
      // Assign a new array to trigger change detection
      this.selectedMiniGames = [...this.selectedMiniGames, gameId];
      configs.addControl(gameId, this.fb.group(this.buildMiniGameControls(gameId)));
    } else {
      this.selectedMiniGames = this.selectedMiniGames.filter(id => id !== gameId);
      configs.removeControl(gameId);
    }
    this.testForm.get('selectedMiniGames')?.setValue(this.selectedMiniGames);
    // Force update and validity check
    configs.updateValueAndValidity();
    this.testForm.get('selectedMiniGames')?.updateValueAndValidity();
  }
  

  buildMiniGameControls(gameId: string): { [key: string]: FormControl | FormGroup } {
    const game = this.allMiniGames.find(g => g.id === gameId);
    const fields = game?.configTemplate || {};
    // Change the return type to allow FormGroup for nested structures
    const controls: { [key: string]: FormControl | FormGroup } = {};

    for (const key in fields) {
      // For TapMatchingPairsConfig.levels, handle as a nested group of controls
      if (gameId === 'tap_matching_pairs' && key === 'levels' && typeof fields['levels'] === 'object') {
        const levels = fields['levels'] as { [level: string]: { minNumber: number; maxNumber: number } };
        const levelGroup: { [level: string]: FormGroup } = {};
        for (const levelKey in levels) {
          levelGroup[levelKey] = this.fb.group({
            minNumber: [levels[levelKey].minNumber, Validators.required],
            maxNumber: [levels[levelKey].maxNumber, Validators.required]
          });
        }
        // Allow FormGroup here
        controls['levels'] = this.fb.group(levelGroup);
        continue;
      }
      // For WhatNumberDoYouHearConfig.languages, handle as a FormControl for array
      // if (gameId === 'what_number_do_you_hear' && key === 'languages' && Array.isArray(fields['languages'])) {
      //   controls['languages'] = new FormControl(fields['languages'], Validators.required);
      //   continue;
      // }
      // Add controls for primitive fields only
      controls[key] = new FormControl(fields[key as keyof typeof fields], Validators.required);
    }

    return controls;
  }  

  onCheckboxChange(event: Event, gameId: string) {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;
    this.onMiniGameToggle(gameId, isChecked);
  }  

  onLanguageCheckboxChange(event: Event, gameId: string, lang: string) {
    const checkbox = event.target as HTMLInputElement;
    const control = this.testForm.get(['miniGameConfigs', gameId, 'languages']);
    if (!control) return;
    const current = control.value || [];
    if (checkbox.checked) {
      if (!current.includes(lang)) {
        control.setValue([...current, lang]);
      }
    } else {
      control.setValue(current.filter((l: string) => l !== lang));
    }
  }

  submitTest(isDraft: boolean) {
    if (this.testForm.invalid) return;

    const testData = this.testForm.value;
    const testId = 'test_' + Date.now();
    const testObject = {
      testName: testData.title,
      teacherId: this.teacherUID,
      grade: testData.classroomId,
      testDuration: testData.testDuration,
      isDraft: isDraft,
      status: isDraft ? 'drafted' : 'published',
      miniGameOrder: testData.selectedMiniGames,
      miniGameConfigs: testData.miniGameConfigs,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      testId: testId,
    };
      
    set(ref(this.db, `tests/${testId}`), testObject)
      .then(() => {
        this.successMessage = isDraft ? '✅ Test saved as draft!' : '✅ Test published successfully!';
        this.errorMessage = '';
        this.testForm.reset();
        this.selectedMiniGames = [];
        setTimeout(() => this.successMessage = '', 2500);
      })
      .catch((err) => {
        this.errorMessage = '❌ Error saving test: ' + (err?.message || err);
        this.successMessage = '';
        setTimeout(() => this.errorMessage = '', 3500);
        console.error('❌ Error saving test:', err);
      });
  }

  getKey(key: any): string {
    return key.key;
  }
  
  getMiniGameConfigKeys(gameId: string): string[] {
    const group = this.testForm.get('miniGameConfigs')?.get(gameId);
    if (!group) return [];
    // For tap_matching_pairs, include 'levels'
    if (gameId === 'tap_matching_pairs') {
      return Object.keys(group.value);
    }
    // For what_number_do_you_hear, include 'languages'
    if (gameId === 'what_number_do_you_hear') {
      return Object.keys(group.value);
    }
    return Object.keys(group.value);
  }

  levelKeys(gameId: string): string[] {
    const levelsGroup = this.testForm.get(['miniGameConfigs', gameId, 'levels']);
    if (levelsGroup && 'controls' in levelsGroup) {
      return Object.keys((levelsGroup as any).controls);
    }
    return [];
  }
}
