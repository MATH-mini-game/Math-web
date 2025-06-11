import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-edit.component.html',
  styleUrl: './test-edit.component.css'
})
export class TestEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private db = inject(Database);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  testForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    classroomId: ['', Validators.required],
    testDuration: [30, [Validators.required, Validators.min(5)]],
    selectedMiniGames: [[]],
    miniGameConfigs: this.fb.group({})
  });

  testId: string | null = null;
  allMiniGames: any[] = [];
  selectedMiniGames: string[] = [];
  gradeLevels: string[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.testId = this.route.snapshot.paramMap.get('id');
    if (!this.testId) return;

    // Load mini-game definitions
    this.http.get('/mini-games.json').subscribe((data: any) => {
      const gameDefs = data.miniGames;
      this.allMiniGames = Object.entries(gameDefs).map(([id, game]: any) => ({
        id,
        title: game.title?.en || id,
        configTemplate: {} // will be filled after loading test
      }));

      // Load test data
      get(ref(this.db, `tests/${this.testId}`)).then(snapshot => {
        if (snapshot.exists()) {
          const test = snapshot.val();
          this.testForm.patchValue({
            title: test.testName,
            classroomId: test.grade,
            testDuration: test.testDuration,
            selectedMiniGames: test.miniGameOrder || []
          });
          this.selectedMiniGames = test.miniGameOrder || [];

          // Set miniGameConfigs
          const configsGroup: { [key: string]: FormGroup | FormControl } = {};
          for (const mgId of this.selectedMiniGames) {
            const config = test.miniGameConfigs?.[mgId] || {};
            configsGroup[mgId] = this.fb.group(this.buildMiniGameControls(mgId, config));
          }
          this.testForm.setControl('miniGameConfigs', this.fb.group(configsGroup));
        }
        this.loading = false;
      });
    });
  }

  buildMiniGameControls(gameId: string, config: any): { [key: string]: FormControl | FormGroup } {
    // Handles both primitive and nested configs (levels, languages)
    const controls: { [key: string]: FormControl | FormGroup } = {};
    for (const key in config) {
      if (gameId === 'tap_matching_pairs' && key === 'levels' && typeof config['levels'] === 'object') {
        const levels = config['levels'];
        const levelGroup: { [level: string]: FormGroup } = {};
        for (const levelKey in levels) {
          levelGroup[levelKey] = this.fb.group({
            minNumber: [levels[levelKey].minNumber, Validators.required],
            maxNumber: [levels[levelKey].maxNumber, Validators.required]
          });
        }
        controls['levels'] = this.fb.group(levelGroup);
        continue;
      }
      if (gameId === 'what_number_do_you_hear' && key === 'languages' && Array.isArray(config['languages'])) {
        controls['languages'] = new FormControl(config['languages'], Validators.required);
        continue;
      }
      controls[key] = new FormControl(config[key], Validators.required);
    }
    return controls;
  }

  onMiniGameToggle(gameId: string, checked: boolean) {
    const configs = this.testForm.get('miniGameConfigs') as FormGroup;
    if (checked) {
      this.selectedMiniGames = [...this.selectedMiniGames, gameId];
      configs.addControl(gameId, this.fb.group({}));
    } else {
      this.selectedMiniGames = this.selectedMiniGames.filter(id => id !== gameId);
      configs.removeControl(gameId);
    }
    this.testForm.get('selectedMiniGames')?.setValue(this.selectedMiniGames);
    configs.updateValueAndValidity();
    this.testForm.get('selectedMiniGames')?.updateValueAndValidity();
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

  getMiniGameConfigKeys(gameId: string): string[] {
    const group = this.testForm.get('miniGameConfigs')?.get(gameId);
    if (!group) return [];
    if (gameId === 'tap_matching_pairs') {
      return Object.keys(group.value);
    }
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

  saveTest() {
    if (this.testForm.invalid || !this.testId) return;
    const testData = this.testForm.value;
    const testObject = {
      testName: testData.title,
      grade: testData.classroomId,
      testDuration: testData.testDuration,
      miniGameOrder: testData.selectedMiniGames,
      miniGameConfigs: testData.miniGameConfigs,
      updatedAt: Date.now()
    };
    update(ref(this.db, `tests/${this.testId}`), testObject)
      .then(() => {
        this.successMessage = '✅ Test updated successfully!';
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 2500);
      })
      .catch((err) => {
        this.errorMessage = '❌ Error updating test: ' + (err?.message || err);
        this.successMessage = '';
        setTimeout(() => this.errorMessage = '', 3500);
        console.error('❌ Error updating test:', err);
      });
  }
}
