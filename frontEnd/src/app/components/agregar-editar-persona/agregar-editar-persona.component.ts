import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Persona } from 'src/app/interfaces/persona';
import { PersonaService } from 'src/app/services/persona.service';

@Component({
  selector: 'app-agregar-editar-persona',
  templateUrl: './agregar-editar-persona.component.html',
  styleUrls: ['./agregar-editar-persona.component.css']
})
export class AgregarEditarPersonaComponent implements OnInit {
  ciudad: string[] = ['Portoviejo', 'Rocafuerte', 'Manta', 'Chone'];
  form: FormGroup;
  maxDate: Date;
  loading: boolean = false;
  operacion: string = 'Agregar ';
  id: number | undefined;

  constructor(public dialogRef: MatDialogRef<AgregarEditarPersonaComponent>,
    private fb: FormBuilder, private _personaService: PersonaService,
    private _snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.maxDate = new Date();
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(20)]],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      ciudad: [null, Validators.required],
      cedula: [null, [Validators.required, Validators.pattern("^[0-9]*$")]],
      fechaNacimiento: [null, Validators.required],
    })
    this.id = data.id;
  }

  ngOnInit(): void {
    this.esEditar(this.id);
  }

  esEditar(id: number | undefined) {
    if (id !== undefined) {
      this.operacion = 'Editar ';
      this.getPersona(id);
    }
  }

  getPersona(id: number) {
    this._personaService.getPersona(id).subscribe(data => {
      console.log(data.fechaNacimiento)
      this.form.setValue({
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        ciudad: data.ciudad,
        cedula: data.cedula,
        fechaNacimiento: new Date(data.fechaNacimiento) 
      })
    })
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  addEditPersona() {

    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value.fechaNacimiento);
    const persona: Persona = {
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      correo: this.form.value.correo,
      ciudad: this.form.value.ciudad,
      cedula: this.form.value.cedula,
      fechaNacimiento: this.form.value.fechaNacimiento.toISOString().slice(0, 10)
    }

    this.loading = true;

    if (this.id == undefined) {

     
      this._personaService.addPersona(persona).subscribe(() => {
        this.loading = false;
        this.dialogRef.close();
        this.mensajeExito('agregada');
      })

    } else {

      
      this._personaService.updatePersona(this.id, persona).subscribe(data => {
        this.loading = false;
        this.dialogRef.close();
        this.mensajeExito('actualizada');
      })
    }
  }

  mensajeExito(operacion: string) {
    this._snackBar.open(`La persona fue ${operacion} con exito`, '', {
      duration: 2000
    });
  }

}
