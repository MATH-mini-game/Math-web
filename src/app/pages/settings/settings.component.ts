import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // Replace with actual user data fetch
    this.settingsForm = this.fb.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    // Optionally, load current user data here and patch the form
    // this.settingsForm.patchValue({ displayName: ..., email: ... });
  }

  saveSettings() {
    if (this.settingsForm.invalid) return;

    // Implement actual save logic here (API call, Firebase, etc.)
    // Show success or error message
    this.successMessage = 'Settings saved!';
    this.errorMessage = '';

    setTimeout(() => this.successMessage = '', 2000);
  }
}
