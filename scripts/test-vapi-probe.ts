const vapi_key = process.env.VAPI_API_KEY || '';

async function probeVapiAccount() {
  console.log('===============================================================');
  console.log('🔍 LIVE VAPI API PROBE: Fetching Complete Account Configuration');
  console.log('===============================================================\n');

  const headers = {
    Authorization: `Bearer ${vapi_key}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch Assistants
  console.log('1. Querying GET https://api.vapi.ai/assistant ...');
  try {
    const res = await fetch('https://api.vapi.ai/assistant', { headers });
    console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
    const data = (await res.json().catch(() => ({}))) as any;

    if (res.ok) {
      const assistants = Array.isArray(data) ? data : [];
      console.log(`   ✅ Assistants Found: ${assistants.length}\n`);

      assistants.forEach((asst, idx) => {
        console.log(`   ──────────────── Assistant #${idx + 1} ────────────────`);
        console.log(`   • ID                 : ${asst.id}`);
        console.log(`   • Name               : ${asst.name || 'Untitled'}`);
        console.log(`   • First Message      : "${asst.firstMessage || 'None'}"`);
        console.log(`   • First Message Mode : ${asst.firstMessageMode || 'assistant-speaks-first'}`);
        console.log(`   • Voicemail Detection: ${asst.voicemailDetection || 'off'}`);
        console.log(`   • Background Sound   : ${asst.backgroundSound || 'off'}`);
        console.log(`   • Max Duration (sec) : ${asst.maxDurationSeconds || 600}s`);

        console.log(`\n   [🧠 LLM Model Configuration]:`);
        console.log(`     - Provider         : ${asst.model?.provider || 'openai'}`);
        console.log(`     - Model            : ${asst.model?.model || 'gpt-4o-mini'}`);
        console.log(`     - Temperature      : ${asst.model?.temperature ?? 'default'}`);
        console.log(`     - Max Tokens       : ${asst.model?.maxTokens ?? 'default'}`);
        console.log(`     - Tools Configured : ${asst.model?.tools?.length || 0}`);

        console.log(`\n   [🗣️ Voice (TTS) Configuration]:`);
        console.log(`     - Provider         : ${asst.voice?.provider || '11labs'}`);
        console.log(`     - Voice ID         : ${asst.voice?.voiceId || 'default'}`);
        console.log(`     - Speed            : ${asst.voice?.speed ?? 1.0}`);
        console.log(`     - Chunk Plan       : ${asst.voice?.chunkPlan ? JSON.stringify(asst.voice.chunkPlan) : 'default'}`);

        console.log(`\n   [🎙️ Transcriber (STT) Configuration]:`);
        console.log(`     - Provider         : ${asst.transcriber?.provider || 'deepgram'}`);
        console.log(`     - Model            : ${asst.transcriber?.model || asst.transcriber?.speechModel || 'nova-2'}`);
        console.log(`     - Language         : ${asst.transcriber?.language || 'en'}`);
        console.log(`     - Confidence Thresh: ${asst.transcriber?.confidenceThreshold ?? 'default'}`);
        console.log(`     - Max Turn Silence : ${asst.transcriber?.maxTurnSilence ?? 'default'} ms`);
        console.log(`     - End Of Turn Conf : ${asst.transcriber?.endOfTurnConfidenceThreshold ?? 'default'}`);
        console.log(`     - VAD Endpointing  : ${asst.transcriber?.vadAssistedEndpointingEnabled ?? 'default'}`);
        console.log(`     - Keywords Boost   : ${asst.transcriber?.keywords ? JSON.stringify(asst.transcriber.keywords) : 'None'}`);
        console.log(`   ────────────────────────────────────────────────\n`);
      });

      if (assistants.length === 0) {
        console.log('   ℹ️ No custom assistants created on this Vapi account yet.');
        console.log('      (BrokerOS will dynamically configure model, voice, transcriber, silence ms, and prompt on dispatch!)\n');
      }
    } else {
      console.log('   ❌ Error Response:', data);
    }
  } catch (err: any) {
    console.log('   ❌ Network Error:', err?.message);
  }

  // 2. Fetch Phone Numbers
  console.log('2. Querying GET https://api.vapi.ai/phone-number ...');
  try {
    const res = await fetch('https://api.vapi.ai/phone-number', { headers });
    console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
    const data = (await res.json().catch(() => ({}))) as any;
    if (res.ok) {
      const numbers = Array.isArray(data) ? data : [];
      console.log(`   ✅ Phone Numbers Found: ${numbers.length}`);
      numbers.forEach((n) => {
        console.log(`     - Phone: ${n.number || n.id} | Provider: ${n.provider || 'Twilio'} | Name: ${n.name || 'DID'}`);
      });
    } else {
      console.log('   Response:', data);
    }
  } catch (err: any) {
    console.log('   Network Error:', err?.message);
  }

  // 3. Fetch Tools / Functions
  console.log('\n3. Querying GET https://api.vapi.ai/tool ...');
  try {
    const res = await fetch('https://api.vapi.ai/tool', { headers });
    console.log(`   Status: HTTP ${res.status} ${res.statusText}`);
    const data = (await res.json().catch(() => ({}))) as any;
    if (res.ok) {
      const tools = Array.isArray(data) ? data : [];
      console.log(`   ✅ Custom Tools/Functions Found: ${tools.length}`);
      tools.forEach((t) => {
        console.log(`     - Tool: ${t.function?.name || t.name || t.id} | Type: ${t.type}`);
      });
    }
  } catch (err: any) {
    console.log('   Network Error:', err?.message);
  }

  console.log('\n===============================================================');
  console.log('🏁 VAPI API PROBE COMPLETE');
  console.log('===============================================================\n');
}

probeVapiAccount();
