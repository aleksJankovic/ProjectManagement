import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { taskCategory } from '../models/taskCategory';


const TASKCATEGORY_API = 'http://localhost:8000/api/TaskCategory';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


@Injectable({
  providedIn: 'root'
})
export class TaskCategoryService {

  constructor(private http: HttpClient) { }


  getTaskCategories() : Observable<taskCategory[]>
  {
    return this.http.get<taskCategory[]>(`${TASKCATEGORY_API}`);
  }
}
