import { Component, OnInit } from '@angular/core';
import { TodosService } from 'src/app/services';

@Component({
  selector: 'app-todos-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss']
})
export class TodosPage implements OnInit {

  constructor(public todosService: TodosService) { }

  ngOnInit(): void {
  }

}
