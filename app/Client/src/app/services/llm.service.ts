import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {LLMResponse} from "../models/llm-response";
import {LlmConversation} from "../models/llm-conversation";

const LLM_API = 'http://kraguj.pmf.kg.ac.rs:12325/api';
const MODEL = 'llama3';

@Injectable({
  providedIn: 'root',
})
export class LLMService {
  constructor(private http: HttpClient) {

  }

  generateText(question: string): Observable<LLMResponse> {
    return this.http.post<LLMResponse>(`${LLM_API}/generate`, {
      model: MODEL,
      prompt: question,
      stream: false
    });
  }

  generateConversation(messages: LlmConversation[]) {
    return this.http.post(`${LLM_API}/chat`, {
      model: MODEL,
      messages: messages,
      stream: false
    });
  }
}
