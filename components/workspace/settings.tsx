"use client";

import {
  Check,
  GraduationCap,
  Keyboard,
  Layers,
  Moon,
  Target,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePrototype } from "./prototype-provider";
import {
  levels,
  flashcardTypes,
  type Level,
  type WorkspaceSettings,
} from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Settings() {
  const { settings, saveSettings } = usePrototype();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  function change<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  return (
    <>
      <PageHeader
        title="Ayarlar"
        description="Öğrenme alışkanlıklarını kendi ritmine göre düzenle."
        actions={
          <Button type="submit" form="workspace-settings" size="small">
            <Check size={14} />
            Değişiklikleri kaydet
          </Button>
        }
      />
      <form
        id="workspace-settings"
        className={`${s.stack} ${s.settings}`}
        onSubmit={(e) => {
          e.preventDefault();
          saveSettings(form);
          setSaved(true);
        }}
      >
        <div className={`${s.panel} ${s.settingsSections}`}>
          <section className={s.settingSection}>
            <div className={s.settingHeading}>
              <GraduationCap />
              <h2>Öğrenme profili</h2>
            </div>
            <div className={s.formGrid}>
              <label className={s.field}>
                <span>Mevcut seviye</span>
                <select
                  className={s.select}
                  value={form.currentLevel}
                  onChange={(e) =>
                    change("currentLevel", e.target.value as Level)
                  }
                >
                  {levels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
                <small>Alıştırmaların başlangıç zorluğunu belirler.</small>
              </label>
              <label className={s.field}>
                <span>Hedef seviye</span>
                <select
                  className={s.select}
                  value={form.targetLevel}
                  onChange={(e) =>
                    change("targetLevel", e.target.value as Level)
                  }
                >
                  {levels.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
                <small>Bir sonraki öğrenme hedefin.</small>
              </label>
            </div>
            <div className={s.settingRow} style={{ marginTop: 12 }}>
              <div>
                <label htmlFor="accent">Tercih edilen aksan</label>
                <p>Telaffuz örnekleri için tercih.</p>
              </div>
              <select
                id="accent"
                className={s.select}
                style={{ width: 136 }}
                value={form.accent}
                onChange={(e) =>
                  change("accent", e.target.value as "US" | "UK")
                }
              >
                <option value="US">US · Amerikan</option>
                <option value="UK">UK · İngiliz</option>
              </select>
            </div>
          </section>
          <section className={s.settingSection}>
            <div className={s.settingHeading}>
              <Target />
              <h2>Günlük hedefler</h2>
            </div>
            <div className={s.formGrid}>
              <label className={s.field}>
                <span>Günlük tekrar hedefi</span>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={form.reviewGoal}
                  onChange={(e) => change("reviewGoal", Number(e.target.value))}
                />
                <small>Her gün tekrar etmek istediğin kart sayısı.</small>
              </label>
              <label className={s.field}>
                <span>Günlük yeni öğe limiti</span>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={form.newLimit}
                  onChange={(e) => change("newLimit", Number(e.target.value))}
                />
                <small>Koleksiyonuna ekleyeceğin yeni ifade sayısı.</small>
              </label>
            </div>
          </section>
          <section className={s.settingSection}>
            <div className={s.settingHeading}>
              <Layers />
              <h2>Flashcard türleri</h2>
            </div>
            {flashcardTypes.map((type) => (
              <div key={type} className={s.settingRow}>
                <label htmlFor={`card-${type}`}>{type}</label>
                <Switch
                  id={`card-${type}`}
                  aria-label={type}
                  checked={form.cardTypes.includes(type)}
                  onCheckedChange={(checked) =>
                    change(
                      "cardTypes",
                      checked
                        ? [...form.cardTypes, type]
                        : form.cardTypes.filter((item) => item !== type),
                    )
                  }
                />
              </div>
            ))}
          </section>
          <section className={s.settingSection}>
            <div className={s.settingHeading}>
              <Keyboard />
              <h2>Klavye kısayolları</h2>
            </div>
            <div className={s.settingRow}>
              <div>
                <label htmlFor="shortcuts">
                  Tekrar kısayollarını etkinleştir
                </label>
                <p>Klavyeyle daha hızlı çalış.</p>
              </div>
              <Switch
                id="shortcuts"
                aria-label="Tekrar kısayolları"
                checked={form.shortcuts}
                onCheckedChange={(checked) => change("shortcuts", checked)}
              />
            </div>
            <div className={s.shortcutList}>
              <span>
                <kbd className={s.kbd}>Space</kbd>Kartın anlamını göster
              </span>
              <span>
                <kbd className={s.kbd}>1–4</kbd>Kartı değerlendir
              </span>
              <span>
                <kbd className={s.kbd}>Ctrl / ⌘ K</kbd>Hızlı arama
              </span>
              <span>
                <kbd className={s.kbd}>Esc</kbd>Paneli kapat
              </span>
            </div>
          </section>
          <section className={s.settingSection}>
            <div className={s.settingHeading}>
              <Moon />
              <h2>Görünüm</h2>
            </div>
            <div className={s.settingRow}>
              <div>
                <span className={s.small}>Koyu tema</span>
                <p>Açık tema ve sistem tercihi sonraki aşamada eklenecek.</p>
              </div>
              <Badge>Aktif</Badge>
            </div>
          </section>
        </div>
        <div className={s.settingsFooter}>
          <p role="status" className={s.caption}>
            {saved ? "Tercihlerin bu çalışma oturumunda kaydedildi." : ""}
          </p>
        </div>
      </form>
    </>
  );
}
