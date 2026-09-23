import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/trial";

module {
  // ---------------------------------------------------------------------------
  // Trial definition (static, Vietnamese content for the "Marketing" career).
  // ---------------------------------------------------------------------------

  let trialTitle : Text = "Chuyên viên Marketing";

  let tasks : [Types.Task] = [
    {
      id = 1;
      title = "Chọn một nhóm khách hàng mục tiêu và mô tả họ trong ba câu";
      order = 1;
      steps = [
        { id = 1; title = "Chọn một sản phẩm hoặc dịch vụ bạn muốn quảng bá"; order = 1 },
        { id = 2; title = "Xác định độ tuổi, giới tính và khu vực của nhóm khách hàng đó"; order = 2 },
        { id = 3; title = "Viết ba câu mô tả họ: họ là ai, họ cần gì, họ gặp khó khăn gì"; order = 3 },
      ];
    },
    {
      id = 2;
      title = "Viết một thông điệp chiến dịch trong một dòng";
      order = 2;
      steps = [
        { id = 4; title = "Xác định lợi ích lớn nhất mà sản phẩm mang lại cho khách hàng"; order = 1 },
        { id = 5; title = "Viết một câu thông điệp ngắn gọn, dễ nhớ, hướng tới lợi ích đó"; order = 2 },
      ];
    },
    {
      id = 3;
      title = "Chọn hai kênh truyền thông và giải thích vì sao mỗi kênh phù hợp";
      order = 3;
      steps = [
        { id = 6; title = "Liệt kê ba kênh bạn đang cân nhắc (ví dụ: Facebook, TikTok, email)"; order = 1 },
        { id = 7; title = "Chọn hai kênh phù hợp nhất với nhóm khách hàng mục tiêu"; order = 2 },
        { id = 8; title = "Viết lý do mỗi kênh phù hợp với khách hàng và ngân sách của bạn"; order = 3 },
      ];
    },
    {
      id = 4;
      title = "Phác thảo lịch đăng bài đơn giản cho một tuần";
      order = 4;
      steps = [
        { id = 9; title = "Chọn số lần đăng bài mỗi tuần mà bạn có thể duy trì"; order = 1 },
        { id = 10; title = "Phân bổ nội dung cho từng ngày (giới thiệu, hướng dẫn, khuyến mãi)"; order = 2 },
        { id = 11; title = "Ghi rõ kênh và thời điểm đăng cho từng bài"; order = 3 },
      ];
    },
    {
      id = 5;
      title = "Chọn một chỉ số bạn sẽ theo dõi để đánh giá thành công";
      order = 5;
      steps = [
        { id = 12; title = "Liệt kê hai chỉ số có thể đo lường được cho chiến dịch"; order = 1 },
        { id = 13; title = "Chọn một chỉ số quan trọng nhất với mục tiêu của bạn"; order = 2 },
        { id = 14; title = "Ghi lại cách bạn sẽ thu thập và theo dõi chỉ số đó"; order = 3 },
      ];
    },
  ];

  let questions : [Types.Question] = [
    {
      id = 1;
      prompt = "Chỉ số nào đo lường tốt nhất số người đã xem một chiến dịch?";
      options = ["Với tới", "Tỷ lệ chuyển đổi", "Giá trị đơn hàng trung bình"];
      order = 1;
    },
    {
      id = 2;
      prompt = "Khi ngân sách còn ít, bạn nên ưu tiên điều gì?";
      options = [
        "Chạy quảng cáo trên thật nhiều kênh cùng lúc",
        "Tập trung vào một kênh hiệu quả nhất và đo lường kỹ",
        "Tăng giá sản phẩm để bù chi phí",
      ];
      order = 2;
    },
    {
      id = 3;
      prompt = "Một thông điệp chiến dịch tốt thường có đặc điểm nào?";
      options = [
        "Dài và mô tả đầy đủ mọi tính năng",
        "Ngắn gọn, tập trung vào một lợi ích rõ ràng",
        "Chỉ nêu giá bán của sản phẩm",
      ];
      order = 3;
    },
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  func emptyProgress() : Types.TrialProgress = {
    completedSteps = [];
    answers = [];
    reflections = [];
    messages = [];
    assessment = null;
  };

  func totalSteps() : Nat {
    var total = 0;
    for (task in tasks.values()) {
      total += task.steps.size();
    };
    total;
  };

  func isStepCompleted(progress : Types.TrialProgress, stepId : Types.StepId) : Bool {
    progress.completedSteps.any(func id = id == stepId);
  };

  func taskCompleted(progress : Types.TrialProgress, task : Types.Task) : Bool {
    task.steps.all(func step = isStepCompleted(progress, step.id));
  };

  func completedTaskCount(progress : Types.TrialProgress) : Nat {
    var count = 0;
    for (task in tasks.values()) {
      if (taskCompleted(progress, task)) {
        count += 1;
      };
    };
    count;
  };

  func answerFor(progress : Types.TrialProgress, questionId : Types.QuestionId) : ?Nat {
    switch (progress.answers.find(func((qid, _)) = qid == questionId)) {
      case (?(_, index)) { ?index };
      case null { null };
    };
  };

  func reflectionFor(progress : Types.TrialProgress, questionId : Types.QuestionId) : ?Text {
    switch (progress.reflections.find(func((qid, _)) = qid == questionId)) {
      case (?(_, note)) { ?note };
      case null { null };
    };
  };

  func answeredCount(progress : Types.TrialProgress) : Nat {
    var count = 0;
    for (question in questions.values()) {
      if (answerFor(progress, question.id) != null) {
        count += 1;
      };
    };
    count;
  };

  func reflectionCount(progress : Types.TrialProgress) : Nat {
    var count = 0;
    for (question in questions.values()) {
      switch (reflectionFor(progress, question.id)) {
        case (?note) {
          if (note.size() > 0) {
            count += 1;
          };
        };
        case null {};
      };
    };
    count;
  };

  func isTrialComplete(progress : Types.TrialProgress) : Bool {
    completedTaskCount(progress) == tasks.size() and answeredCount(progress) == questions.size();
  };

  func nextMessageId(progress : Types.TrialProgress) : Types.MessageId {
    var maxId = 0;
    for (message in progress.messages.values()) {
      if (message.id > maxId) {
        maxId := message.id;
      };
    };
    maxId + 1;
  };

  func makeMessage(id : Types.MessageId, role : Types.ChatRole, text : Text) : Types.ChatMessage {
    { id; role; text; createdAt = Time.now() };
  };

  // ---------------------------------------------------------------------------
  // Assessment
  // ---------------------------------------------------------------------------

  func computeAssessment(progress : Types.TrialProgress) : Types.Assessment {
    let doneTasks = completedTaskCount(progress);
    let doneSteps = progress.completedSteps.size();
    let answered = answeredCount(progress);
    let reflected = reflectionCount(progress);

    let strengths = List.empty<Text>();
    let improvements = List.empty<Text>();
    let suggestions = List.empty<Text>();

    if (doneTasks >= 4) {
      strengths.add("Bạn đã hoàn thành gần như toàn bộ nhiệm vụ, cho thấy sự kiên trì và khả năng tổ chức công việc tốt.");
    } else if (doneTasks >= 2) {
      strengths.add("Bạn đã hoàn thành một phần đáng kể các nhiệm vụ, cho thấy bạn biết bắt đầu và duy trì tiến độ.");
    } else {
      strengths.add("Bạn đã bắt đầu làm quen với các nhiệm vụ marketing, đó là bước khởi đầu quan trọng.");
    };

    if (reflected >= 2) {
      strengths.add("Bạn dành thời gian tự suy ngẫm sau mỗi câu hỏi, một thói quen quan trọng của người làm marketing giỏi.");
    };

    if (answered >= 2) {
      strengths.add("Bạn trả lời các câu hỏi kiểm tra nhanh một cách nghiêm túc, thể hiện sự hiểu biết về các khái niệm cơ bản.");
    };

    if (doneSteps < totalSteps()) {
      improvements.add("Hoàn thành nốt các bước còn lại để có bức tranh đầy đủ về quy trình làm marketing.");
    };

    if (reflected < questions.size()) {
      improvements.add("Viết ghi chú tự suy ngẫm cho mỗi câu hỏi để rèn luyện tư duy phân tích.");
    };

    if (answered < questions.size()) {
      improvements.add("Trả lời đủ các câu hỏi kiểm tra nhanh để nắm vững kiến thức nền tảng.");
    };

    improvements.add("Luyện tập viết thông điệp ngắn gọn, tập trung vào một lợi ích duy nhất cho khách hàng.");
    improvements.add("Học cách đọc số liệu: phân biệt với tới, tỷ lệ chuyển đổi và giá trị đơn hàng trung bình.");

    suggestions.add("Hãy bắt đầu với một chiến dịch nhỏ trên một kênh duy nhất, sau đó đo lường và mở rộng dần.");
    suggestions.add("Ghi lại mục tiêu và chỉ số theo dõi cho mỗi chiến dịch trước khi bắt đầu triển khai.");
    suggestions.add("Đọc thêm về hành vi khách hàng mục tiêu để viết thông điệp sát nhu cầu hơn.");

    if (doneTasks >= 4 and answered >= 2 and reflected >= 2) {
      suggestions.add("Bạn đã sẵn sàng thử một chiến dịch thật với ngân sách nhỏ để kiểm chứng các giả định.");
    };

    let fitLevel : Types.FitLevel = if (doneTasks >= 4 and answered >= 2 and reflected >= 2) {
      #strong;
    } else if (doneTasks >= 2 and answered >= 1) {
      #moderate;
    } else {
      #developing;
    };

    {
      fitLevel;
      strengths = strengths.toArray();
      improvements = improvements.toArray();
      suggestions = suggestions.toArray();
      createdAt = Time.now();
    };
  };

  // ---------------------------------------------------------------------------
  // Mentor reply (deterministic, grounded in the caller's real progress)
  // ---------------------------------------------------------------------------

  func mentorReply(progress : Types.TrialProgress, userText : Text) : Text {
    let doneTasks = completedTaskCount(progress);
    let doneSteps = progress.completedSteps.size();
    let answered = answeredCount(progress);
    let reflected = reflectionCount(progress);

    let parts = List.empty<Text>();

    parts.add(
      "Cảm ơn bạn đã chia sẻ. Mình đã xem lại tiến độ Career Trial Marketing của bạn: "
      # doneTasks.toText() # "/" # tasks.size().toText() # " nhiệm vụ đã hoàn thành, "
      # doneSteps.toText() # "/" # totalSteps().toText() # " bước đã tích, "
      # answered.toText() # "/" # questions.size().toText() # " câu kiểm tra nhanh đã trả lời."
    );

    if (doneTasks < tasks.size()) {
      parts.add("Bạn còn " # (tasks.size() - doneTasks).toText() # " nhiệm vụ chưa xong. Hãy chọn nhiệm vụ nhỏ nhất và làm từng bước một để giữ đà.");
    } else {
      parts.add("Bạn đã hoàn thành toàn bộ nhiệm vụ — đây là dấu hiệu tốt về sự kiên trì trong nghề marketing.");
    };

    if (reflected < questions.size()) {
      parts.add("Hãy thử viết ghi chú tự suy ngẫm cho mỗi câu hỏi; việc này giúp bạn nhớ lâu và tư duy có hệ thống hơn.");
    };

    let lower = userText.toLower();
    if (lower.contains(#text "kênh") or lower.contains(#text "facebook") or lower.contains(#text "tiktok")) {
      parts.add("Về kênh truyền thông: hãy chọn kênh nơi khách hàng mục tiêu của bạn dành nhiều thời gian nhất, và bắt đầu với một kênh duy nhất để dễ đo lường.");
    } else if (lower.contains(#text "chỉ số") or lower.contains(#text "số liệu") or lower.contains(#text "đo lường")) {
      parts.add("Về chỉ số: với tới cho biết bao nhiêu người thấy nội dung, tỷ lệ chuyển đổi cho biết bao nhiêu người hành động. Hãy chọn chỉ số gắn trực tiếp với mục tiêu của chiến dịch.");
    } else if (lower.contains(#text "nội dung") or lower.contains(#text "bài viết") or lower.contains(#text "thông điệp")) {
      parts.add("Về nội dung: một thông điệp tốt chỉ nói một lợi ích rõ ràng. Hãy thử viết ba phiên bản rồi chọn bản dễ hiểu nhất.");
    } else if (lower.contains(#text "ngân sách") or lower.contains(#text "chi phí")) {
      parts.add("Về ngân sách: hãy bắt đầu nhỏ, đo lường kết quả, rồi mới tăng dần cho kênh mang lại hiệu quả tốt nhất.");
    } else {
      parts.add("Nếu bạn muốn đi sâu hơn, hãy thử hoàn thành thêm một nhiệm vụ rồi quay lại đây — mình sẽ tư vấn dựa trên kết quả mới của bạn.");
    };

    parts.add("Bạn có thể hỏi mình về kênh truyền thông, chỉ số đo lường, nội dung hoặc ngân sách bất cứ lúc nào.");

    parts.toArray().values().join(" ");
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /// The trial definition (tasks + quick-check questions) shown to every caller.
  public func getTrial() : Types.TrialView {
    {
      title = trialTitle;
      tasks;
      questions;
      progress = emptyProgress();
    };
  };

  /// The caller's persisted progress, or an empty progress record on first visit.
  public func getProgress(progress : Map.Map<Principal, Types.TrialProgress>, caller : Principal) : Types.TrialProgress {
    progress.get(caller) ?? emptyProgress();
  };

  /// Tick or untick a step. Returns the caller's updated progress.
  public func setStepCompleted(
    progress : Map.Map<Principal, Types.TrialProgress>,
    caller : Principal,
    stepId : Types.StepId,
    completed : Bool,
  ) : Types.TrialProgress {
    let current = progress.get(caller) ?? emptyProgress();
    let updatedSteps = if (completed) {
      if (isStepCompleted(current, stepId)) {
        current.completedSteps;
      } else {
        current.completedSteps.concat([stepId]);
      };
    } else {
      current.completedSteps.filter(func id = id != stepId);
    };
    let updated : Types.TrialProgress = { current with completedSteps = updatedSteps };
    progress.add(caller, updated);
    updated;
  };

  /// Record the caller's selected option for a quick-check question.
  public func setAnswer(
    progress : Map.Map<Principal, Types.TrialProgress>,
    caller : Principal,
    questionId : Types.QuestionId,
    optionIndex : Nat,
  ) : Types.TrialProgress {
    let current = progress.get(caller) ?? emptyProgress();
    let kept = current.answers.filter(func((qid, _)) = qid != questionId);
    let updated : Types.TrialProgress = { current with answers = kept.concat([(questionId, optionIndex)]) };
    progress.add(caller, updated);
    updated;
  };

  /// Record the caller's free-text reflection for a quick-check question.
  public func setReflection(
    progress : Map.Map<Principal, Types.TrialProgress>,
    caller : Principal,
    questionId : Types.QuestionId,
    note : Text,
  ) : Types.TrialProgress {
    let current = progress.get(caller) ?? emptyProgress();
    let kept = current.reflections.filter(func((qid, _)) = qid != questionId);
    let updated : Types.TrialProgress = { current with reflections = kept.concat([(questionId, note)]) };
    progress.add(caller, updated);
    updated;
  };

  /// Append a user turn to the mentor chat and return the mentor's reply.
  public func sendMentorMessage(
    progress : Map.Map<Principal, Types.TrialProgress>,
    caller : Principal,
    text : Text,
  ) : Types.ChatMessage {
    let current = progress.get(caller) ?? emptyProgress();
    let userId = nextMessageId(current);
    let userMessage = makeMessage(userId, #user, text);
    let withUser : Types.TrialProgress = { current with messages = current.messages.concat([userMessage]) };
    let reply = makeMessage(userId + 1, #mentor, mentorReply(withUser, text));
    let updated : Types.TrialProgress = { withUser with messages = withUser.messages.concat([reply]) };
    progress.add(caller, updated);
    reply;
  };

  /// The caller's mentor chat history, oldest first.
  public func getMentorMessages(progress : Map.Map<Principal, Types.TrialProgress>, caller : Principal) : [Types.ChatMessage] {
    (progress.get(caller) ?? emptyProgress()).messages;
  };

  /// The caller's suitability assessment, or null until the trial is complete.
  /// Deterministic from the caller's progress, so it is safe to compute in a query.
  public func getAssessment(progress : Map.Map<Principal, Types.TrialProgress>, caller : Principal) : ?Types.Assessment {
    let current = progress.get(caller) ?? emptyProgress();
    if (not isTrialComplete(current)) {
      return null;
    };
    switch (current.assessment) {
      case (?existing) { ?existing };
      case null { ?computeAssessment(current) };
    };
  };
};
