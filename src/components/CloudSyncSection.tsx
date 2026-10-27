import { useEffect, useState } from "react";
import { CloudSync, generatePairingKey, getSyncInfo, type SyncInfo } from "../lib/cloud-sync";
import { toast, sfx } from "../lib/ui";
import { Icon } from "./Icon";
import { confirmDialog } from "./ConfirmProvider";

export function CloudSyncSection() {
  const [syncInfo, setSyncInfo] = useState<SyncInfo>(getSyncInfo());
  const [inputKey, setInputKey] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  useEffect(() => {
    return CloudSync.subscribe((info) => {
      setSyncInfo(info);
    });
  }, []);

  const handleGenerateKey = async () => {
    sfx("click");
    const newKey = generatePairingKey();
    const res = await CloudSync.setSyncKey(newKey);
    if (res.success) {
      toast(`新しい同期キー「${newKey}」を発行して連携しました！`, "success");
      setShowQr(true);
    } else {
      toast(res.message, "error");
    }
  };

  const handleConnect = async () => {
    const key = inputKey.trim();
    if (!key) {
      toast("同期キーまたは合言葉を入力してください", "error");
      return;
    }
    sfx("click");
    setIsSyncingNow(true);
    const res = await CloudSync.setSyncKey(key);
    setIsSyncingNow(false);
    if (res.success) {
      toast(`同期キー「${key}」でクラウド同期を有効にしました！`, "success");
      setInputKey("");
    } else {
      toast(res.message, "error");
    }
  };

  const handleSyncNow = async () => {
    sfx("click");
    setIsSyncingNow(true);
    const res = await CloudSync.syncNow();
    setIsSyncingNow(false);
    if (res.success) {
      toast("最新データをクラウドと自動同期しました！", "success");
    } else {
      toast(res.message, "error");
    }
  };

  const handleDisconnect = async () => {
    sfx("click");
    const ok = await confirmDialog({
      title: "クラウド同期の解除",
      message: "クラウド同期を解除しますか？\n（この端末に保存されている学習データは削除されません）",
      confirmLabel: "解除する",
      cancelLabel: "キャンセル",
      danger: true,
    });
    if (ok) {
      CloudSync.disconnect();
      toast("クラウド同期を解除しました", "info");
    }
  };

  const copyKey = () => {
    if (!syncInfo.syncKey) return;
    navigator.clipboard?.writeText(syncInfo.syncKey);
    toast(`同期キー「${syncInfo.syncKey}」をコピーしました！`, "success");
  };

  const syncUrl = syncInfo.syncKey
    ? `${window.location.origin}${window.location.pathname}?sync=${encodeURIComponent(syncInfo.syncKey)}`
    : "";

  const qrImageUrl = syncUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(syncUrl)}&margin=10`
    : "";

  return (
    <section className="settings-group cloud-sync-group">
      <div className="settings-group__head">
        <h2>
          <Icon name="cloud" size={18} /> クラウド自動同期（PC・スマホ連携）
        </h2>
        <p>一度キーを登録すれば、PCとスマホで学習データが全自動でリアルタイム同期されます。毎日QRコードを撮る必要はありません。</p>
      </div>

      {syncInfo.syncKey ? (
        // ---------------- Connected State ----------------
        <div className="cloud-sync-card cloud-sync-card--connected">
          <div className="cloud-sync-status-bar">
            <div className="cloud-sync-badge-active">
              <span className="cloud-sync-pulse" />
              <span>自動同期中</span>
            </div>
            <div className="cloud-sync-last-time muted tiny">
              {syncInfo.lastSyncedAt
                ? `最終同期: ${new Date(syncInfo.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "同期準備完了"}
            </div>
          </div>

          <div className="cloud-sync-key-box">
            <div className="cloud-sync-key-label">あなたの同期キー</div>
            <div className="cloud-sync-key-row">
              <span className="cloud-sync-key-code">{syncInfo.syncKey}</span>
              <button
                type="button"
                className="btn btn--soft btn--sm"
                onClick={copyKey}
                title="キーをコピー"
              >
                <Icon name="copy" size={14} /> コピー
              </button>
            </div>
            <p className="tiny muted" style={{ marginTop: 6 }}>
              もう一台の端末（スマホなど）で同じキーを入力するか、下のQRコードを1回だけ読み取ると連携できます。
            </p>
          </div>

          <div className="cloud-sync-actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleSyncNow}
              disabled={isSyncingNow || syncInfo.status === "syncing"}
            >
              <Icon name="refresh" size={14} className={isSyncingNow ? "spin" : ""} />
              {isSyncingNow ? "同期中..." : "今すぐ同期"}
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setShowQr(!showQr)}
            >
              <Icon name="camera" size={14} />
              {showQr ? "QRコードを隠す" : "📱 スマホ連携用QRを表示"}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm btn--danger-text"
              onClick={handleDisconnect}
            >
              <Icon name="trash" size={14} /> 解除
            </button>
          </div>

          {showQr && (
            <div className="cloud-sync-qr-pane">
              <div className="cloud-sync-qr-title">
                <Icon name="zap" size={16} /> スマホで初回読み取り
              </div>
              <p className="tiny muted" style={{ marginBottom: 12 }}>
                スマホの標準カメラでこのQRコードを<strong>1回だけ</strong>読み取ると、自動で同期設定が完了します。
              </p>
              <div className="cloud-sync-qr-img-wrap">
                <img src={qrImageUrl} alt="同期用QRコード" width={180} height={180} />
              </div>
              <div className="tiny muted center" style={{ marginTop: 8 }}>
                読み取り後、次回からは何もしなくても自動で同期されます。
              </div>
            </div>
          )}
        </div>
      ) : (
        // ---------------- Disconnected State ----------------
        <div className="cloud-sync-card">
          <div className="cloud-sync-banner">
            <div className="cloud-sync-banner__icon">☁️</div>
            <div>
              <div className="cloud-sync-banner__title">PCとスマホの学習データを完全自動で一致</div>
              <div className="cloud-sync-banner__desc">
                PCで覚えた単語・獲得したXP・クイズ結果が、スマホでもそのまま使えます。
              </div>
            </div>
          </div>

          <div className="cloud-sync-setup-grid">
            {/* Option A: Generate New Key */}
            <div className="cloud-sync-setup-card">
              <div className="cloud-sync-step-badge">方法 1（おすすめ）</div>
              <div className="cloud-sync-setup-title">新しい同期キーを発行</div>
              <p className="tiny muted">
                この端末専用のキーをワンクリックで発行し、スマホと連携します。
              </p>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                style={{ width: "100%", marginTop: 12 }}
                onClick={handleGenerateKey}
              >
                <Icon name="key" size={15} /> キーを新規発行して始める
              </button>
            </div>

            {/* Option B: Enter Existing Key */}
            <div className="cloud-sync-setup-card">
              <div className="cloud-sync-step-badge">方法 2</div>
              <div className="cloud-sync-setup-title">既存のキー / 合言葉で連携</div>
              <p className="tiny muted">
                PCで発行したキー、またはお好きな合言葉（英数字）を入力して連携します。
              </p>
              <div className="cloud-sync-input-row" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  className="input input--sm"
                  placeholder="例: EQ-8492"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConnect();
                  }}
                />
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  onClick={handleConnect}
                  disabled={isSyncingNow}
                >
                  連携
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
