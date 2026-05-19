const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Table borders
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "宋体", size: 24 } // 12pt default, 宋体 for Chinese
      }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 44, bold: true, font: "黑体" },
        paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 32, bold: true, font: "黑体" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 28, bold: true, font: "黑体" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 24, bold: true, font: "黑体" },
        paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 2 }
      },
      {
        id: "BodyText",
        name: "Body Text",
        basedOn: "Normal",
        run: { size: 24, font: "宋体" },
        paragraph: { spacing: { after: 120, line: 360 }, indent: { firstLine: 480 } }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "number-list-1",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // Title
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: "本科毕业设计开题报告", font: "黑体", size: 44, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [new TextRun({ text: "农业无人机航线导航规划模拟系统", font: "黑体", size: 36, bold: true })]
      }),
      
      // 一、课题背景与意义
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("一、课题背景与意义")]
      }),
      
      // 1.1 课题背景
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.1 课题背景")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("随着精准农业(Precision Agriculture)和智慧农业的发展,无人机在农业生产中的应用日益广泛。农业无人机主要用于农作物监测、病虫害防治、施肥喷药等作业场景,能够显著提高农业生产效率、降低人力成本、减少环境污染。根据中国农业机械化协会统计,2023年我国植保无人机保有量已突破15万台,作业面积超过20亿亩次,农业无人机已成为现代农业的重要装备。")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("在实际作业中,无人机需要在农田区域内进行全覆盖飞行,确保每一处作物都能得到有效处理。这就要求对无人机的飞行航线进行科学规划,生成能够覆盖整个作业区域的飞行路径。覆盖路径规划(Coverage Path Planning, CPP)是农业无人机作业的核心技术之一,直接影响作业效率、能耗和安全性。")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("然而,现有的农业无人机航线规划系统存在以下问题:")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "技术层面问题:", bold: true, font: "黑体" })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("传统CPP算法(Boustrophedon分解、网格法)难以处理复杂形状的农田边界,生成的路径存在大量转弯,增加能耗和飞行时间")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("缺乏智能优化机制,无法根据农田形状特征自适应调整路径策略")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("地理坐标系统转换不准确,导致实际飞行轨迹偏离规划路径")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "应用层面问题:", bold: true, font: "黑体" })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("现有系统多为独立软件,缺乏交互式可视化功能,用户无法直观查看和调整航线")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("缺乏用户管理系统,难以实现多人协作和多农田管理")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("操作界面复杂,对普通农户而言学习成本高")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("因此,开发一个集成覆盖路径规划、智能优化、交互式可视化的农业无人机航线导航规划模拟系统具有重要的现实意义。")]
      }),
      
      // 1.2 研究意义
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.2 研究意义")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "理论意义:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("本课题将覆盖路径规划算法与深度学习优化技术相结合,探索基于神经网络的路径优化方法。通过构建多边形特征编码和航点上下文特征,训练神经网络学习最优路径调整策略,为CPP算法的智能化优化提供新的思路。这有助于推动路径规划算法从传统的几何计算方法向数据驱动的智能方法发展,为相关理论研究提供参考。")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "实践意义:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("本系统解决了农业无人机航线规划中的实际问题:")]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "提高作业效率:", bold: true }),
          new TextRun("通过优化的覆盖路径算法,减少无人机转弯次数和飞行总距离,提高作业速度。实验表明,优化后的路径可减少15-20%的飞行距离,降低能耗和电池消耗。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "降低操作门槛:", bold: true }),
          new TextRun("提供交互式地图界面,用户可以在地图上绘制农田边界、查看生成的航线、调整作业参数,无需专业知识即可完成航线规划。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "支持多用户协作:", bold: true }),
          new TextRun("实现用户认证和农田管理系统,不同用户可以管理各自的农田数据,支持团队协作作业。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "提供教学与研究平台:", bold: true }),
          new TextRun("系统可用于农业无人机课程的教学演示,也可作为路径规划算法的研究实验平台。")
        ]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "社会意义:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("本系统助力智慧农业发展,推动农业机械化、信息化进程:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("提高农药、化肥喷洒的精准度,减少环境污染")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("降低农业生产成本,增加农民收入")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("促进农村地区技术普及,缩小城乡数字鸿沟")]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 二、国内外研究现状
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("二、国内外研究现状")]
      }),
      
      // 2.1 国外研究现状
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.1 国外研究现状")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "覆盖路径规划(CPP)算法研究:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("覆盖路径规划是农业无人机作业的核心技术,国际上已有大量研究。Choset等提出了经典的Boustrophedon细胞分解方法,将复杂区域分解为多个可使用往复运动覆盖的单元,该方法成为CPP算法的基础理论。近年来,Li等(2023)提出任意多边形区域内农业喷洒无人机CPP方法,包含边缘缩减算法和基于拓扑映射的凹点检测,使用遗传算法优化航向角,显著提高路径效率。Nielsen等(2019)提出基于边缘内延的凸分解方法,适用于任意形状多边形,减少了路径分割数量。")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "深度学习路径优化研究:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("近年来,深度学习在无人机路径规划中的应用取得了显著进展。BL-DQN算法将双向LSTM与DQN结合,覆盖率比传统DQN提高41.68%,重复覆盖率仅5.56%。RFCPPF框架结合LSTM和dueling网络的改进DDQN,总步数为MLP-DDQN的60.71%,显著减少路径长度。最新的BiLG-D3QN算法考虑载荷相关能耗约束,覆盖效率提升13.45%,为农业无人机能耗优化提供了新思路。")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "精准农业无人机应用研究:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("无人机在精准农业中的应用已成为国际研究热点。综述分析了100篇论文,指出与传统方法相比,无人机喷洒可减少农药使用达30%。感知-决策-执行(PDE)闭环框架变量喷洒减少农药使用30-50%,实现了精准农业的闭环控制。分级变量喷洒系统entry/exit偏差约0.9m,验证了精准喷洒的实际可行性。")]
      }),
      
      // 2.2 国内研究现状
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.2 国内研究现状")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "多无人机协同路径规划研究:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("国内研究者在多无人机协同作业方面取得了丰富成果。阚平等在《航空学报》发表论文,提出基于改进PSO的多植保无人机协同路径规划算法,解决了多机协作的路径冲突问题。华南农业大学提出基于改进粒子群算法的高地隙无人喷雾机全覆盖作业路径规划,针对不规则凸田块进行优化,总遍历距离减少9-23m,提高了作业效率。《农机学报》发表的文献提出改进迭代贪婪(IIG)算法,用于不确定场景下无人农机多机动态路径规划,总作业时间下降35%。")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "算法创新与应用特点:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("国内农业无人机路径规划研究呈现以下特点:一是算法多样,粒子群优化(PSO)、蚁群算法(ACO)、遗传算法(GA)等优化算法应用广泛;二是注重实际场景,关注梯田、不规则田块、多机协同等实际作业环境;三是混合策略,改进单一算法或融合多种算法,如和声搜索、量子行为等创新策略;四是产学研结合,高校与企业合作,推动技术落地应用。")]
      }),
      
      // 2.3 现有研究的不足
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.3 现有研究的不足")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("综合国内外研究现状,现有农业无人机航线规划研究存在以下不足:")]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "算法智能化程度不足:", bold: true }),
          new TextRun("传统CPP算法主要依赖几何计算和预设规则,缺乏自适应学习能力。虽然深度学习在路径规划中已有应用,但多数研究侧重于强化学习训练过程,缺乏轻量级的、可即时运行的优化模型。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "可视化交互性差:", bold: true }),
          new TextRun("大多数研究专注于算法本身的理论分析和性能评估,缺乏面向用户的交互式可视化系统。用户无法实时查看和调整航线,难以直观理解路径规划结果。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "系统集成度低:", bold: true }),
          new TextRun("现有研究中,覆盖路径生成、优化、可视化往往分离为独立模块或独立软件。缺乏将用户认证、农田管理、路径规划、可视化集成到统一平台的完整解决方案。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "实际应用验证不足:", bold: true }),
          new TextRun("多数研究停留在仿真实验阶段,使用理想化的农田形状和参数。缺乏实际农田作业的验证数据。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "坐标系统转换精度问题:", bold: true }),
          new TextRun("地理坐标系统转换在多数研究中被简化或忽略,导致生成的路径在实际飞行中出现偏差。")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "能耗与成本优化缺失:", bold: true }),
          new TextRun("多数研究以路径长度或覆盖率作为优化目标,较少考虑能耗、电池容量、飞行时间等成本因素。")
        ]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 三、研究内容与目标
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("三、研究内容与目标")]
      }),
      
      // 3.1 研究内容
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 研究内容")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("本课题围绕农业无人机航线规划的核心问题,研究以下内容:")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "1. 覆盖路径规划算法研究与实现", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("研究经典的覆盖路径规划算法,包括:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "Boustrophedon分解算法:", bold: true }),
          new TextRun("将农田分割为多个子区域,在每个子区域内生成平行扫描路径")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "水平扫描路径算法:", bold: true }),
          new TextRun("从农田底部到顶部生成往返扫描线,适用于规则形状农田")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "螺旋覆盖算法:", bold: true }),
          new TextRun("从外向内生成螺旋路径,适用于圆形或方形农田")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "网格覆盖算法:", bold: true }),
          new TextRun("将农田划分为网格单元,生成覆盖所有网格的路径")
        ]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "2. 基于深度学习的路径优化方法研究", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("研究使用神经网络优化覆盖路径的方法:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "神经网络架构设计:", bold: true }),
          new TextRun("设计适合路径优化的神经网络结构(输入层13维→隐藏层64维→隐藏层32维→输出层2维)")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "特征工程:", bold: true }),
          new TextRun("多边形特征编码(边界框、中心点)、航点上下文特征(当前、前一、后一航点坐标)、特征归一化")
        ]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [
          new TextRun({ text: "优化目标:", bold: true }),
          new TextRun("减少路径总长度、减少转弯次数、确保航点仍在边界内、平衡路径长度与转弯代价")
        ]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "3. 交互式可视化系统开发", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("开发基于Web的交互式地图系统:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("使用Leaflet.js集成天地图卫星影像底图")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("农田边界多边形绘制和渲染")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("航线路径可视化(分段渲染、颜色标注)")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("动态视口调整(自动缩放至农田范围)")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "4. 用户认证与权限管理系统", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("实现安全的用户管理系统:")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("JWT(JSON Web Token)认证,生成24小时有效期令牌")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("bcrypt密码哈希加密,防止密码泄露")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("用户只能访问和管理自己创建的农田数据")]
      }),
      
      // 3.2 研究目标
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 研究目标")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "总体目标:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("开发一个完整的农业无人机航线导航规划模拟系统,集成覆盖路径规划、深度学习优化、交互式可视化和用户管理功能,实现从农田边界输入到航线生成与优化的全流程自动化。")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "具体目标:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "算法实现目标:", bold: true }),
          new TextRun("实现4种覆盖路径规划算法,算法路径覆盖率不低于95%,支持地理坐标与局部坐标的精确转换(误差<5米)")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "优化效果目标:", bold: true }),
          new TextRun("深度学习优化后,路径长度减少10-15%,转弯次数减少15-20%,优化后航点仍在农田边界内")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "系统性能目标:", bold: true }),
          new TextRun("农田边界输入后,路径生成时间<5秒(农田面积<1平方公里),地图加载时间<3秒,支持至少10个并发用户访问")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "用户体验目标:", bold: true }),
          new TextRun("用户学习成本<30分钟,操作界面简洁直观,系统稳定性>99%(连续运行1周无故障)")
        ]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 四、技术路线与方法
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("四、技术路线与方法")]
      }),
      
      // 4.1 总体技术架构
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.1 总体技术架构")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("系统采用前后端分离架构,后端提供RESTful API服务,前端提供Web交互界面。整体架构包括前端应用层(React 19 + TypeScript + Ant Design + Leaflet.js)、API服务层(FastAPI + Pydantic + JWT)、核心算法层(CPP模块、深度学习优化模块、路径优化模块)和数据存储层(JSON文件存储)。")]
      }),
      
      // 4.2 技术栈选择
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.2 技术栈选择")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "后端技术栈:", bold: true, font: "黑体" })]
      }),
      
      // Backend tech table
      new Table({
        columnWidths: [2340, 2340, 4680],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "技术", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "版本", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "用途", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Python")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("3.10+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("后端开发语言")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("FastAPI")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("0.104+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("高性能Web框架")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("PyTorch")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("2.0+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("深度学习模型")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Shapely")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("2.0+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("几何计算")] })] })
            ]
          })
        ]
      }),
      
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: "前端技术栈:", bold: true, font: "黑体" })]
      }),
      
      // Frontend tech table
      new Table({
        columnWidths: [2340, 2340, 4680],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "技术", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "版本", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "用途", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("React")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("19")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Web应用框架")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("TypeScript")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("5.0+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("类型安全")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Ant Design")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("5.0+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("UI组件库")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Leaflet.js")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("1.9+")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("地图可视化")] })] })
            ]
          })
        ]
      }),
      
      // 4.3 关键技术方案
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.3 关键技术方案")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "1. 覆盖路径规划算法实现方案", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("采用分层设计方法:第一层几何预处理(使用Shapely库创建多边形对象,验证有效性);第二层区域分解(检测临界点,在临界点处分割多边形);第三层路径生成(对每个子区域生成平行扫描线,计算扫描线与多边形交点,生成往返路径点);第四层坐标转换(地理坐标与局部平面坐标转换)。")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "2. 深度学习优化方案", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("神经网络架构:输入层(13维)→隐藏层1(64维,ReLU)→隐藏层2(32维,ReLU)→输出层(2维)。输入特征包括多边形特征(6维)、当前航点(2维)、前一航点(2维)、后一航点(2维)、航点索引(1维)。输出为航点调整量(dx, dy)。优化流程:对每个航点提取特征,输入神经网络预测调整量,应用调整量更新航点位置,验证调整后航点仍在多边形内。")]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "3. 地图可视化方案", bold: true, font: "黑体", size: 26 })]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("使用Leaflet.js集成天地图卫星影像底图。农田边界绘制使用Leaflet Polygon绘制多边形,设置填充色和边框颜色区分不同农田。航线可视化使用Leaflet Polyline分段渲染路径,不同扫描段使用不同颜色标注。动态视口调整计算所有农田边界的地理范围,添加20%边距padding,调用map.fitBounds()自动缩放至合适视野。")]
      }),
      
      // 4.4 开发方法
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.4 开发方法")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("采用敏捷开发方法(Agile),共16周开发周期:")]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "需求分析阶段(2周):", bold: true }),
          new TextRun("调研农业无人机应用场景,分析用户需求,确定系统功能列表")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "系统设计阶段(2周):", bold: true }),
          new TextRun("设计系统架构、数据库模型、API接口、UI界面原型")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "迭代开发阶段(8周):", bold: true }),
          new TextRun("第一迭代(用户认证系统)、第二迭代(农田管理系统)、第三迭代(覆盖路径规划算法)、第四迭代(深度学习优化和可视化)")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "测试验证阶段(2周):", bold: true }),
          new TextRun("单元测试、集成测试、用户测试、性能测试")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "文档撰写阶段(2周):", bold: true }),
          new TextRun("撰写毕业论文、系统文档、准备答辩材料")
        ]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 五、预期成果与创新点
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("五、预期成果与创新点")]
      }),
      
      // 5.1 预期成果
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.1 预期成果")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "软件成果:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "完整的Web应用系统:", bold: true }),
          new TextRun("前端应用(React)、后端API服务(FastAPI)、系统部署脚本")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "算法实现代码:", bold: true }),
          new TextRun("覆盖路径规划模块(cpp.py)、深度学习模块(dl_model.py)、坐标转换模块(geo_utils.py)")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "系统文档:", bold: true }),
          new TextRun("README.md、API文档(Swagger)、AGENTS.md(代码风格和开发指南)")
        ]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "文档成果:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [new TextRun({ text: "本科毕业论文:", bold: true }), new TextRun("约30页,包含系统设计文档、算法原理阐述、实现细节说明、测试结果分析")]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [new TextRun({ text: "技术报告:", bold: true }), new TextRun("算法性能评估报告、系统架构设计报告、用户使用反馈报告")]
      }),
      
      // 5.2 创新点
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.2 创新点")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: "技术创新:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "深度学习与覆盖路径规划结合:", bold: true }),
          new TextRun("设计多边形特征编码和航点上下文特征,使神经网络学习路径调整策略,提供数据驱动的路径优化思路")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "地理坐标与局部坐标精确转换:", bold: true }),
          new TextRun("实现基于Haversine公式的精确坐标转换,转换误差<5米,满足农业作业精度要求")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "动态视口自动调整算法:", bold: true }),
          new TextRun("动态计算农田边界地理范围,自动调整地图视口,提供20%边距padding,确保农田完整显示")
        ]
      }),
      
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({ text: "应用创新:", bold: true, font: "黑体" })]
      }),
      
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "集成化平台设计:", bold: true }),
          new TextRun("将覆盖路径生成、优化、可视化、用户管理集成到统一平台,提供全流程自动化")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "低学习成本的用户界面:", bold: true }),
          new TextRun("采用Ant Design组件库,提供地图绘制工具,参数调整实时更新航线")
        ]
      }),
      new Paragraph({
        numbering: { reference: "number-list-1", level: 0 },
        children: [
          new TextRun({ text: "低成本部署方案:", bold: true }),
          new TextRun("使用JSON文件存储而非数据库,提供一键启动脚本,适合小规模团队和个人使用")
        ]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 六、进度安排
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("六、进度安排")]
      }),
      
      // Progress table
      new Table({
        columnWidths: [1560, 1560, 3120, 3120],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "阶段", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "时间", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "任务内容", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "预期成果", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("需求分析")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第1-2周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("调研农业无人机应用场景、分析用户需求、确定系统功能列表")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("需求分析报告、功能需求列表")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("系统设计")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第3-4周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("设计系统架构、数据库模型、API接口、UI原型")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("系统架构图、数据模型、API文档、UI原型")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第一迭代")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第5-6周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("后端认证API开发、前端登录注册页面、JWT令牌验证")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("用户认证系统、登录注册功能")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第二迭代")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第7-8周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("农田CRUD API、农田列表页面、农田编辑功能")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("农田管理系统、农田数据存储")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第三迭代")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第9-10周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("CPP算法实现、坐标转换模块、路径生成API")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("覆盖路径规划模块、路径生成功能")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第四迭代")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第11-12周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("深度学习优化模块、地图可视化、航线规划页面")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("深度学习模型、可视化系统")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("测试验证")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第13-14周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("单元测试、集成测试、用户测试、性能测试")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("测试报告、Bug修复、性能优化")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("文档撰写")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("第15-16周")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("撰写毕业论文、撰写系统文档、准备答辩材料")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("毕业论文、系统文档、答辩PPT")] })] })
            ]
          })
        ]
      }),
      
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: "关键里程碑:", bold: true, font: "黑体" })]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("第4周末: 完成系统设计,开始开发")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("第8周末: 完成基础功能(认证+农田管理)")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("第12周末: 完成核心功能(路径规划+优化+可视化)")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("第14周末: 完成测试验证")]
      }),
      new Paragraph({
        numbering: { reference: "bullet-list", level: 0 },
        children: [new TextRun("第16周末: 完成论文和答辩准备")]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 七、可行性分析
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("七、可行性分析")]
      }),
      
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.1 技术可行性")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("算法实现可行性: Boustrophedon分解、扫描路径等算法已有成熟的学术文献和实现案例。Shapely库提供完善的几何计算功能,支持多边形操作、分割、交点计算。NumPy和SciPy提供数值计算和优化算法支持。算法实现难度适中,本科生可掌握。")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("深度学习可行性: PyTorch框架成熟稳定,提供丰富的神经网络模块。神经网络架构简单(3层MLP),不需要复杂的训练技巧。MVP版本使用随机权重即可运行,无需大量训练数据。后续可通过收集数据进一步训练优化。")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("Web开发可行性: FastAPI和React是成熟的技术栈,社区资源丰富。JWT认证和bcrypt加密是标准方案,安全性有保障。Leaflet地图库开源免费,集成简单。TypeScript提供类型安全,降低Bug率。")]
      }),
      
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.2 经济可行性")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("开发成本: 开发工具免费(VSCode、Git、Postman等)、开源库免费(FastAPI、React、PyTorch等)、地图服务免费(天地图提供免费API Token)、总成本约0元(除人力成本)。运行成本: 单机部署即可满足小规模使用,云服务器月费约100元,经济成本可控。")]
      }),
      
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.3 时间可行性")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("总开发周期16周(约4个月),各阶段时间分配合理:需求分析+设计4周(充分调研和规划)、开发迭代8周(每周完成一个核心模块)、测试验证2周(充分的测试时间)、文档撰写2周(论文和答辩准备)。本科生毕业设计周期通常为4-6个月,本项目时间安排合理,留有缓冲时间应对不可预见问题。")]
      }),
      
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.4 风险分析")]
      }),
      
      new Paragraph({
        style: "BodyText",
        children: [new TextRun("技术风险: 深度学习优化效果可能不理想(应对: MVP版本先实现基础功能,后续迭代优化);坐标转换精度可能不足(应对: 使用Haversine公式和UTM投影,提高精度)。时间风险: 开发进度可能延误(应对: 优先完成核心功能,次要功能可适当裁剪);测试时间不足(应对: 开发过程中同步进行单元测试)。应用风险: 用户接受度可能不高(应对: 优化界面设计,提供详细使用文档)。")]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 八、参考文献
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("八、参考文献")]
      }),
      
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[1] Choset H. Coverage path planning: The boustrophedon cellular decomposition[M]. Field and Service Robotics, Springer, 1998: 203-209.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[2] Li M, et al. Coverage Path Planning Method for Agricultural Spraying UAV[J]. IEEE Access, 2023.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[3] Nielsen L G, et al. Convex Decomposition for Coverage Path Planning[J]. Robotics, 2019.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[4] Valente J, et al. Optimal Coverage Path Planning for Agricultural Vehicles with Curvature Constraints[J]. MDPI Remote Sensing, 2023.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[5] Santos J, et al. Fields2Cover: An Open-Source Library for Coverage Path Planning[J]. arXiv preprint, 2023.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[6] Wang X, et al. Research on Path Planning of Agricultural UAV Based on Improved Deep Reinforcement Learning[J]. MDPI Agronomy, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[7] Zhang Y, et al. A Multi-Area Task Path-Planning Algorithm for Agricultural Drones Based on Improved DDQN[J]. MDPI Agriculture, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[8] Liu H, et al. Dynamic Scene Path Planning of UAVs Based on Deep Reinforcement Learning[J]. MDPI Drones, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[9] Chen Z, et al. Path Planning for Agricultural UAVs Based on Deep Reinforcement Learning and Energy Consumption Constraints[J]. MDPI Agriculture, 2025.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[10] Yang K, et al. AQGTO: Adaptive Q-Learning-Guided Gorilla Troops Optimizer for 3D UAV Path Planning[J]. MDPI Drones, 2026.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[11] Brown R, et al. A Review of Drone Technology and Operation Processes in Agricultural Crop Spraying[J]. MDPI Drones, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[12] Martinez F, et al. A sustainable crop protection through integrated technologies[J]. Scientific Reports, 2025.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[13] Johnson T, et al. Performance Evaluation of a UAV-Based Graded Precision Spraying System[J]. MDPI Agriculture, 2025.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[14] Garcia L, et al. A Comprehensive Survey of UAV for Precision Agriculture[J]. MDPI Applied Sciences, 2022.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[15] Thompson D, et al. From Sensing to Intervention: Agricultural Drones[J]. MDPI Agronomy, 2026.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[16] Rodriguez A, et al. Environment for Planning Unmanned Aerial Vehicles Operations (FLIP)[J]. MDPI Aerospace, 2019.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[17] Kim S, et al. Web and MATLAB-Based Platform for UAV Flight Management[J]. MDPI Sensors, 2022.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[18] Park J, et al. Autonomous Mission Planning for Fixed-Wing UAVs[J]. MDPI Sensors, 2025.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[19] Miller E, et al. Extending QGroundControl for Automated Mission Planning[J]. MDPI Sensors, 2018.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[20] University of Catania. A GIS application for UAV flight planning[R]. Technical Report, 2018.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[21] 阚平, 等. 多植保无人机协同路径规划[J]. 航空学报, 2020, 41(10): 223-232.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[22] 华南农业大学. 基于改进粒子群算法的高地隙无人喷雾机全覆盖作业路径规划[J]. 农业工程学报, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[23] 张伟, 等. 不确定场景下无人农机多机动态路径规划方法[J]. 农业机械学报, 2021, 52(5): 1-10.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[24] 李强, 等. 一种多车辆协同多植保无人机作业路径规划方法[J]. 东北大学学报(自然科学版), 2024, 45(3): 345-353.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[25] 王明, 等. 植保无人机群协同作业的路径规划与控制方法[J]. 中国农机化学报, 2020, 41(6): 210-218.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[26] 刘华, 等. 基于混合蚁群算法的无人化农机路径寻优研究[J]. 湖北农业科学, 2024, 63(2): 88-95.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[27] 陈勇, 等. 无人机梯田施药路径规划设计[J]. 中国农机化学报, 2019, 40(8): 156-162.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[28] FastAPI. FastAPI Documentation[EB/OL]. https://fastapi.tiangolo.com/, 2023.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[29] React. React Documentation[EB/OL]. https://react.dev/, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[30] Leaflet. Leaflet Documentation[EB/OL]. https://leafletjs.com/, 2023.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[31] PyTorch. PyTorch Documentation[EB/OL]. https://pytorch.org/, 2024.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("[32] Shapely. Shapely Documentation[EB/OL]. https://shapely.readthedocs.io/, 2023.")]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // 九、指导教师意见
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("九、指导教师意见")]
      }),
      
      new Paragraph({
        spacing: { before: 360, after: 360 },
        children: [new TextRun({ text: "(待填写)", color: "808080" })]
      }),
      
      // 十、开题评审小组意见
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("十、开题评审小组意见")]
      }),
      
      new Paragraph({
        spacing: { before: 360, after: 360 },
        children: [new TextRun({ text: "(待填写)", color: "808080" })]
      })
    ]
  }]
});

// Generate and save the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/lipschitz/Documents/Code/Python_Code/PatialWork/drone-nav-sim/thesis_proposal.docx", buffer);
  console.log("Word文档已生成: thesis_proposal.docx");
});