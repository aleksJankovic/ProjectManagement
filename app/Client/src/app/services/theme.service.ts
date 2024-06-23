import {Injectable} from "@angular/core";
import themes from "../../assets/themes.json";
import { Theme } from "../models/theme";
import {of} from "rxjs";
import {StyleService} from "./style.service";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(private styleService: StyleService) {
  }

  getThemeOptions() {
    const options: Theme[] = themes;
    return of(options);
  }

  setTheme(theme: string) {
    this.styleService.setStyle(
      "theme",
      `../../assets/themes/${theme}.css`
    );
  }
}
